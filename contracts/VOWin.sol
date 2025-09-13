// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "./NativeTokenTransferer.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

/// @author 0xCocomastoras
/// @title A lottery protocol , using chainlink's vrf and automation

contract VOWin is NativeTokenTransferer, VRFConsumerBaseV2, AutomationCompatibleInterface{
    event RequestSent(uint256 indexed RequestId, uint256 NumOfWords);
    event RequestFulfilled(uint256 indexed RequestId, uint256[] RandomWords);
    event RoundStarted(uint256 indexed RoundId);
    event RoundCancelled(uint256 indexed RoundId);
    event RoundResolved(uint256 indexed RoundId, address indexed Winner, uint256 TotalPrice, uint256 WinnerEntry, uint256 TotalPlayers);
    event EnteredRound(uint256 indexed RoundId, address indexed User, uint256 Amount);
    event ClaimedWinnings(uint256 indexed RoundId, address indexed User, uint256 Amount);
    event ClaimedCancelled(uint256 indexed RoundId, address indexed User, uint256 Amount);
    event ClaimedFees(address indexed Operator, uint256 Amount);

    address public admin;
    /// @dev current round
    uint256 roundId = 1;
    /// @dev max different users per round
    uint256 public maxEntries = 50;
    /// @dev protocol fees
    uint256 public fees;
    /// @dev minimum bet in wei
    uint256 public minimumValue;
    /// @dev check on contract's state
    uint256 initialised;
    /// @dev freeze/unfreeze contract
    uint256 frozen;
    /// @dev list of roundId's of all cancelled rounds
    uint256[] cancelledRounds;
    /// @dev list of roundId's of all completed rounds
    uint256[] completedRounds;
    /// @dev roundId -> user address -> owned tickets
    mapping(uint256 => mapping(address => uint256)) roundIdToUserToTickets;
    /// @dev roundId -> total tickets before fee
    mapping(uint256 => uint256)  roundIdToTotalTickets;
    /// @dev roundId -> cancelled flag
    mapping(uint256 => uint256)  roundIdToCancelled;
    /// @dev roundId -> winner address or address(0)
    mapping(uint256 => address)  roundIdToWinner;
    /// @dev roundId -> vrf's request id
    mapping(uint256 => uint256)  public roundIdToRequestId;
    /// @dev roundId -> round status on redeem
    mapping(uint256 => uint256) public redeemed;
    /// @dev  vrf's requestId -> request body
    mapping(uint256 => Requests) public requestIdToRequest;
    /// @dev roundId -> round expiration
    mapping(uint256 => uint256) roundIdToExpiration;
    /// @dev roundId -> flag on vrf's request state
    mapping(uint256 => uint256) upkeepSent;

    using EnumerableSet for EnumerableSet.AddressSet;
    /// @dev roundId -> list of rounds participants
    mapping(uint256 => EnumerableSet.AddressSet) roundIdToParticipants;
    /// @dev user's address -> list of all entered roundids
    mapping(address => uint256[]) public userToEnteredRounds;

    VRFCoordinatorV2Interface immutable COORDINATOR;

    struct Requests {
        bool exists;
        uint256 response;
        bool fulfilled;

    }

    struct RoundInfo {
        uint256 RoundId;
        uint256 TotalTickets;
        address Winner;
        uint256 Expiration;
        uint256 WinnerBet;
        uint256 Cancelled;
        uint256 TotalPlayers;
    }

    struct UserRoundInfo {
        uint256 RoundId;
        uint256 TotalTickets;
        uint256 UserTotalTickets;
        address Winner;
        uint256 Expiration;
        uint256 WinnerBet;
        uint256 Cancelled;
        uint256 TotalPlayers;
    }

    /// @notice Constructor of the contract, sets the vrfCoordinator address
    constructor(address vrfCoordinator)VRFConsumerBaseV2(vrfCoordinator){
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    }

    /**
        @notice Caller initialises the contract
        @param _admin The address of the admin
        @param minValue The minimum entry bet in wei
    */
    function initialise(address _admin, address _feeSink, uint256 minValue) external {
        require(minValue != 0, 'NVV');
        require(initialised == 0, 'AI');
        initialised = 1;
        admin = _admin;
        fee_sink = payable(_feeSink);
        minimumValue = minValue;
        // initialises the first round and sets the expiration to 5 mins
        roundIdToExpiration[roundId] = block.timestamp + 300;
    }

    /// @dev Vrf's configuration
    bytes32 constant S_KEYHASH = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
    uint32 constant CALLBACK_GAS_LIMIT = 1000000;
    uint16 constant REQUEST_CONFIRMATIONS = 3;
    uint32 constant NUM_WORDS = 1;
    uint64 constant S_SUBSCRIPTIONID = 1;
    /// @dev protocol's fee in bps
    uint256 constant FEE_BPS = 1000;

    /// @dev fee sink address
    address fee_sink;

    /**
        @notice Caller enters the current round with the msg.value
    */
    function enterRound() external payable {
        // revert if contract is frozen
        require(frozen == 0, 'CF');
        // revert if value less than minimum expected
        require(msg.value >= minimumValue,  'NVV');
        // revert if round expired
        require(roundIdToExpiration[roundId] > block.timestamp, 'NVT');
        // revert if contract not initialised
        require(initialised !=0, 'NIY');
        uint256 shares = msg.value;
        // check if caller already entered this round
        if (!roundIdToParticipants[roundId].contains(msg.sender)) {
            roundIdToParticipants[roundId].add(msg.sender);
            userToEnteredRounds[msg.sender].push(roundId);
        }
        //revert if participants more than max entries
        require(roundIdToParticipants[roundId].length() <= maxEntries, 'MER');
        emit EnteredRound(roundId, msg.sender, msg.value);
        unchecked {
            roundIdToUserToTickets[roundId][msg.sender] += shares;
            roundIdToTotalTickets[roundId] += shares;
        }
    }

    /**
        @notice Caller claims his winnings
        @param roundId_ The round that he wants to redeem
    */
    function claimWinnings(uint256 roundId_) external {
        // revert if caller is not the winner
        require(msg.sender == roundIdToWinner[roundId_], 'NVS');
        // revert id caller already redeemed this round
        require(redeemed[roundId_] == 0, 'AR');
        // revert if round cancelled
        require(roundIdToCancelled[roundId_] == 0, 'RC');
        // set the market redeemed/ protect against reentrancy
        redeemed[roundId_] = 1;
        // calculate winnings and fees
        (uint256 winnings, uint256 pendingFees) = _calculateWinnings(roundId_);
        unchecked {
            fees += pendingFees;
        }
        emit ClaimedWinnings(roundId_, msg.sender, winnings);
        _performNativeTransfer(msg.sender, winnings);
    }

    /**
        @notice Caller claims his bet
        @param roundId_ The round that he wants to redeem
    */
    function redeemCancelled(uint256 roundId_) external {
        // revert if round not cancelled
        require(roundIdToCancelled[roundId_] == 1, 'NC');
        // user's bet
        uint256 amount = roundIdToUserToTickets[roundId_][msg.sender];
        // protect against reentrancy
        roundIdToUserToTickets[roundId_][msg.sender] = 0;
        emit ClaimedCancelled(roundId_, msg.sender, amount);
        _performNativeTransfer(msg.sender, amount);
    }

    /**
        @notice Caller claims pending winnnings
        @param roundIds A list of roundIds to redeem
    */
    function redeemAllPendingWinnings(uint256[] calldata roundIds) external {
        uint256 len = roundIds.length;
        uint256 amount;
        for(uint i =0; i<len;) {
            // check if round is cancelled or completed
            if (roundIdToCancelled[roundIds[i]] == 1 && roundIdToUserToTickets[roundIds[i]][msg.sender] != 0) {
                unchecked{
                    uint256 temp = roundIdToUserToTickets[roundIds[i]][msg.sender];
                    amount += temp;
                    roundIdToUserToTickets[roundIds[i]][msg.sender] = 0;
                    emit ClaimedCancelled(roundIds[i], msg.sender, temp);
                }
            } else {
                // check if caller is the winner and round not redeemed already
                if (roundIdToWinner[roundIds[i]] == msg.sender && redeemed[roundIds[i]] == 0) {
                    unchecked{
                        redeemed[roundIds[i]] = 1;
                        (uint256 winnings, uint256 pendingFees) = _calculateWinnings(roundIds[i]);
                        fees += pendingFees;
                        amount += winnings;
                        emit ClaimedWinnings(roundIds[i], msg.sender, winnings);
                    }
                }
            }
            unchecked {
                i++;
            }
        }
        _performNativeTransfer(msg.sender, amount);
    }

    /**
        @notice Contract sends pending fees to feeSink
    */
    function claimFees() external {
        uint256 pendingFees = fees;
        fees = 0;
        emit ClaimedFees(msg.sender, pendingFees);
        _performNativeTransfer(fee_sink, pendingFees);
    }

    /**
        @notice Admin sets the new minimum entry price in wei
        @param value_ The new minimum value in wei
    */
    function changeMinValue(uint256 value_) external {
        require(msg.sender == admin, 'NVS');
        minimumValue = value_;
    }

    /**
        @notice Admin freezes the contract
    */
    function freezeContract() external {
        require(msg.sender == admin, 'NVS');
        frozen = 1;

        // Current round is cancelled
        roundIdToCancelled[roundId] = 1;
        roundIdToWinner[roundId] = address(0);
    }

    /**
        @notice Admin unfreezes the contract and begins a new round
    */
    function unfreezeContract() external {
        require(msg.sender == admin, 'NVS');
        frozen = 0;
        unchecked {
            roundId++;
            roundIdToExpiration[roundId] = block.timestamp + 300;
        }
    }

    /**
        @notice Admin updates the fee sink address
        @param feeSink_ The new feeSink address
    */
    function updateFeeSink(address feeSink_) external {
        require(msg.sender == admin, 'NVS');
        fee_sink = payable(feeSink_);
    }

     /**
        @notice Response of VRF
    */
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        // revert if not valid reuqestId
        require(!requestIdToRequest[_requestId].fulfilled && requestIdToRequest[_requestId].exists);
        if (roundIdToCancelled[roundId] == 0) {
            requestIdToRequest[_requestId].fulfilled = true;
            requestIdToRequest[_requestId].response = _randomWords[0];
            emit RequestFulfilled(_requestId, _randomWords);
            // elect winner
            _electWinner(_randomWords[0]);
            roundId++;
            emit RoundStarted(roundId);
            // init next round
            roundIdToExpiration[roundId] = block.timestamp + 300;
        }
    }

    /**
        @notice Admin action that sets new maxEntries per round
        @param maxEntries_ The new max entries per round
    */
    function changeMaxEntries(uint256 maxEntries_) external {
        require(msg.sender == admin, 'NVS');
        maxEntries = maxEntries_;
    }

    /**
        @notice Standard automation function,
        returns true if round has expired and an upkeep has not yet sent
    */
    function checkUpkeep(bytes calldata checkData) external view override returns (bool upkeepNeeded, bytes memory performData) {
        if(block.timestamp > roundIdToExpiration[roundId] && roundIdToExpiration[roundId] != 0 && upkeepSent[roundId] == 0 && initialised != 0 && frozen == 0) {
            return (true, checkData);
        }
    }

    /**
        @notice Standard automation function,
    */
    function performUpkeep(bytes calldata performData) external {
        //revert if round is not expired , or contract is frozen
        require(block.timestamp > roundIdToExpiration[roundId] && roundIdToExpiration[roundId] != 0 && frozen == 0);
        // if less than 2 participants cancel the round
        if(roundIdToParticipants[roundId].length() < 2) {
            roundIdToCancelled[roundId] = 1;
            emit RoundCancelled(roundId);
            cancelledRounds.push(roundId);
            // init new round
            roundId++;
            roundIdToExpiration[roundId] = block.timestamp + 300;
            emit RoundStarted(roundId);
        } else {
            upkeepSent[roundId] = 1;
            completedRounds.push(roundId);
            _requestRandomWords();
        }
    }

    /**
        @notice View function that returns the total entered rounds for user
    */
    function getUsersNumOfEnteredRounds() external view returns (uint256) {
        return userToEnteredRounds[msg.sender].length;
    }

    /**
        @notice View function that scans user's entered markets for pending winnings
    */
    function filterPendingWinningEntriesForUser(uint256 index, uint256 length) external view returns (uint256[] memory LotteryIds, uint256[] memory Status, uint256[] memory Winnings) {
        uint256 arrIndex;
        uint256 totalLength = userToEnteredRounds[msg.sender].length;
        uint256 limit = index + length;
        if (index > totalLength) {
            return (LotteryIds, Status, Winnings);
        }
        LotteryIds = new uint256[](length);
        Status = new uint256[](length);
        Winnings = new uint256[](length);
        for(uint i = index; i < limit;) {
            if (i >= totalLength) {
                break;
            }
            uint round = userToEnteredRounds[msg.sender][i];
            uint userRoundTickets = roundIdToUserToTickets[round][msg.sender];
            if (roundIdToWinner[round] == msg.sender && redeemed[round] == 0) {
                LotteryIds[arrIndex] = round;
                Status[arrIndex] = 0;
                Winnings[arrIndex] = roundIdToTotalTickets[round];
                arrIndex++;
            } else if (roundIdToCancelled[round] == 1 && userRoundTickets != 0) {
                LotteryIds[arrIndex] = round;
                Status[arrIndex] = 1;
                Winnings[arrIndex] = userRoundTickets;
                arrIndex++;
            }
            unchecked {
                ++i;
            }
        }
        if(length > arrIndex) {
            assembly {
                let decrease := sub(length, arrIndex)
                mstore(LotteryIds, sub(mload(LotteryIds), decrease))
                mstore(Status, sub(mload(Status), decrease))
                mstore(Winnings, sub(mload(Winnings), decrease))
            }
        }
    }

    /**
        @notice View function that returns given round's winnner info
    */
    function getRoundWinnerInfo(uint256 roundId_) external view returns (address, uint256, uint256) {
        address winner = roundIdToWinner[roundId_];
        return(winner, roundIdToUserToTickets[roundId_][winner], roundIdToTotalTickets[roundId_]);
    }

    /**
        @notice View function that returns given round's winner
    */
    function getRoundWinner(uint256 roundId_) external view returns (address) {
        return roundIdToWinner[roundId_];
    }

    /**
        @notice View function that returns given round's total amount
    */
    function getRoundAmount(uint256 roundId_) external view returns (uint256) {
        return roundIdToTotalTickets[roundId_];
    }

    /**
        @notice View function that returns given round's total participants
    */
    function getRoundParticipants(uint256 roundId_) external view returns(address[] memory) {
        return roundIdToParticipants[roundId_].values();
    }

    /**
        @notice View function that returns given round's total participants and corresponding amounts
    */
    function getAmountsForParticipants(uint256 roundId_) external view returns(address[] memory, uint256[] memory) {
        address[] memory participants = roundIdToParticipants[roundId_].values();
        uint256[] memory amounts = new uint256[](participants.length);
        for(uint i =0; i< participants.length;) {
            amounts[i] = roundIdToUserToTickets[roundId_][participants[i]];
            unchecked {
                ++i;
            }
        }
        return(participants, amounts);
    }

    /**
        @notice View function that returns current round's info
    */
    function getRoundInfo() external view returns (uint256, uint256, uint256, uint256, uint256, address[] memory, uint256[] memory) {
        address[] memory participants = roundIdToParticipants[roundId].values();
        uint256[] memory amounts = new uint256[](participants.length);
        for(uint i =0; i< participants.length;) {
            amounts[i] = roundIdToUserToTickets[roundId][participants[i]];
            unchecked {
                ++i;
            }
        }
        return(roundId, roundIdToTotalTickets[roundId], roundIdToExpiration[roundId], minimumValue, maxEntries, participants, amounts);
    }
    /**
        @notice View function that returns given rounds info
        @dev Suggested limit is 400
    */
    function getHistoryWithPagination(uint256 fromRoundId, uint256 length) external view returns (RoundInfo[] memory Round) {
        require(fromRoundId <= roundId, 'NVR');
        if (length > fromRoundId) length = fromRoundId;
        Round = new RoundInfo[](length);
        uint256 index;
        for (uint i = fromRoundId; i > 0;) {
            address winner = roundIdToWinner[i];
            Round[index] = RoundInfo(i, roundIdToTotalTickets[i], winner, roundIdToExpiration[i], roundIdToUserToTickets[i][winner], roundIdToCancelled[i], roundIdToParticipants[i].length());
            unchecked {
                index++;
                i--;
            }
            if(index >= length) break;
        }
    }

    /**
        @notice View function that returns given completed rounds info
        @dev Suggested limit is 1500
    */
    function getCompletedHistoryWithPagination(uint256 startIndex, uint256 length) external view returns (RoundInfo[] memory Round) {
        if (startIndex + length > completedRounds.length) length = completedRounds.length - startIndex;
        Round = new RoundInfo[](length);
        uint index;
        for (uint i = startIndex; i < length + startIndex;) {
            uint round = completedRounds[i];
            address winner = roundIdToWinner[round];
            Round[index] = RoundInfo(round, roundIdToTotalTickets[round], winner, roundIdToExpiration[round], roundIdToUserToTickets[round][winner], roundIdToCancelled[round], roundIdToParticipants[round].length());
            unchecked {
                index++;
                i++;
            }
        }
    }

    /**
        @notice View function that returns given cancelled rounds info
        @dev Suggested limit is 2000
    */
    function getCancelledHistoryWithPagination(uint256 startIndex, uint256 length) external view returns (RoundInfo[] memory Round) {
        if (startIndex + length > cancelledRounds.length) length = cancelledRounds.length - startIndex;
        Round = new RoundInfo[](length);
        uint index;
        for (uint i = startIndex; i < length + startIndex;) {
            uint round = cancelledRounds[i];
            Round[index] = RoundInfo(round, roundIdToTotalTickets[round], address(0), roundIdToExpiration[round], 0, roundIdToCancelled[round], roundIdToParticipants[round].length());
            unchecked {
                index++;
                i++;
            }
        }
    }

    /**
        @notice View function that returns completed and cancelled rounds info for given user
        @dev Suggested limit is 1500
    */
    function getUsersLastRoundsEntered(address user, uint256 length) external view returns(UserRoundInfo[] memory CompletedRounds, UserRoundInfo[] memory CancelledRounds) {
        uint256 roundLength = userToEnteredRounds[user].length;
        uint256 completedIndex;
        uint256 cancelledIndex;
        CompletedRounds = new UserRoundInfo[](length);
        CancelledRounds = new UserRoundInfo[](length);
        if (roundLength < length) {
            for(uint i = 0; i < roundLength;) {
                uint round = userToEnteredRounds[user][i];
                if (roundIdToCancelled[round] == 1) {
                    CancelledRounds[cancelledIndex] = UserRoundInfo(round, roundIdToTotalTickets[round], roundIdToUserToTickets[round][user], address(0), roundIdToExpiration[round], 0, 1, roundIdToParticipants[round].length());
                    unchecked {
                        cancelledIndex++;
                    }
                } else {
                    address winner = roundIdToWinner[round];
                    CompletedRounds[completedIndex] = UserRoundInfo(round, roundIdToTotalTickets[round], roundIdToUserToTickets[round][user], winner, roundIdToExpiration[round], roundIdToUserToTickets[round][winner], 0, roundIdToParticipants[round].length());
                    unchecked {
                        completedIndex++;
                    }
                }
                unchecked {
                    i++;
                }
            }
        } else {
            for(uint i = roundLength - length; i < roundLength;) {
                uint round = userToEnteredRounds[user][i];
                if (roundIdToCancelled[round] == 1) {
                    CancelledRounds[cancelledIndex] = UserRoundInfo(round, roundIdToTotalTickets[round], roundIdToUserToTickets[round][user], address(0), roundIdToExpiration[round], 0, 1, roundIdToParticipants[round].length());
                    unchecked {
                        cancelledIndex++;
                    }
                } else {
                    address winner  = roundIdToWinner[round];
                    CompletedRounds[completedIndex] = UserRoundInfo(round, roundIdToTotalTickets[round], roundIdToUserToTickets[round][user], winner, roundIdToExpiration[round], roundIdToUserToTickets[round][winner], 0, roundIdToParticipants[round].length());
                    unchecked {
                        completedIndex++;
                    }
                }
                unchecked {
                    i++;
                }
            }
        }
        if (completedIndex < length) {
             assembly {
                let decrease := sub(length, completedIndex)
                mstore(CompletedRounds, sub(mload(CompletedRounds), decrease))
            }
        }
        if (cancelledIndex < length) {
             assembly {
                let decrease := sub(length, cancelledIndex)
                mstore(CancelledRounds, sub(mload(CancelledRounds), decrease))
            }
        }
    }

    /**
        @notice View function that returns totalRounds, completed rounds and cancelled rounds
    */
    function getTotalRoundInfo() external view returns(uint256, uint256, uint256) {
        return(roundId, completedRounds.length, cancelledRounds.length);
    }

    /**
        @notice Inner function that calculates round winnings and fees
        @param roundId_ The round's id to calculate
    */
    function _calculateWinnings(uint256 roundId_) internal view returns (uint256, uint256) {
        // fee is flat 10%
        uint256 fee = roundIdToTotalTickets[roundId_] * FEE_BPS / 10000;
        return (roundIdToTotalTickets[roundId_] - fee, fee);
    }

    /**
        @notice Inner function that calculates the current rounds winner
        @param vrfResponse The vrf's response
    */
    function _electWinner(uint256 vrfResponse) internal{
        // check if round has no tickets
        uint256 totalTickets = roundIdToTotalTickets[roundId];
        if (totalTickets != 0) {
            // calculate the winning ticket
            uint256 winnerSlot = vrfResponse % totalTickets;
            uint256 totalParticipants = roundIdToParticipants[roundId].length();
            // last accessed slot
            uint256 lastSlot;
            // Search for the user that has the ticket with the winningSlot
            for(uint i = 0; i < totalParticipants;) {
                address participant = roundIdToParticipants[roundId].at(i);
                lastSlot += roundIdToUserToTickets[roundId][participant];
                if (lastSlot > winnerSlot) {
                    roundIdToWinner[roundId] = participant;
                    emit RoundResolved(roundId, participant, totalTickets, roundIdToUserToTickets[roundId][participant], totalParticipants);
                    break;
                }
                unchecked {
                    ++i;
                }
            }
        }
    }

     /**
        @notice Inner function that asks for a vrf
    */
    function _requestRandomWords() internal returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            S_KEYHASH,
            S_SUBSCRIPTIONID,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        roundIdToRequestId[roundId] = requestId;
        requestIdToRequest[requestId].exists = true;
        emit RequestSent(requestId, NUM_WORDS);
        return requestId;
    }
}

