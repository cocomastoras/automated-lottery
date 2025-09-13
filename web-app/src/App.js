import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import {toBigInt} from "ethers";
import * as utils from "ethers";
const { ethers } = require("ethers");

function App() {
    const getBotUpdates = () => fetch("https://api.telegram.org/bot6053496110:AAEuLqx3o4D9JIBmm9de5_2GmvbIl5YCIUg/getUpdates").then((response) => console.log(response.json()))
    const contractAbi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "maxEntries_",
				"type": "uint256"
			}
		],
		"name": "changeMaxEntries",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "have",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "want",
				"type": "address"
			}
		],
		"name": "OnlyCoordinatorCanFulfill",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "MarketId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "User",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "Amount",
				"type": "uint256"
			}
		],
		"name": "ClaimedCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "Operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "Amount",
				"type": "uint256"
			}
		],
		"name": "ClaimedFees",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "MarketId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "User",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "Amount",
				"type": "uint256"
			}
		],
		"name": "ClaimedWinnings",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "claimFees",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "marketId_",
				"type": "uint256"
			}
		],
		"name": "claimWinnings",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "MarketId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "User",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "Amount",
				"type": "uint256"
			}
		],
		"name": "EnteredMarket",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "enterMarket",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "performData",
				"type": "bytes"
			}
		],
		"name": "performUpkeep",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "randomWords",
				"type": "uint256[]"
			}
		],
		"name": "rawFulfillRandomWords",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "marketId_",
				"type": "uint256"
			}
		],
		"name": "redeemCancelled",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "RequestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "RandomWords",
				"type": "uint256[]"
			}
		],
		"name": "RequestFulfilled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "RequestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "NumOfWords",
				"type": "uint256"
			}
		],
		"name": "RequestSent",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "MarketId",
				"type": "uint256"
			}
		],
		"name": "RoundCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "MarketId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "Winner",
				"type": "address"
			}
		],
		"name": "RoundResolved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "MarketId",
				"type": "uint256"
			}
		],
		"name": "RoundStarted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "checkData",
				"type": "bytes"
			}
		],
		"name": "checkUpkeep",
		"outputs": [
			{
				"internalType": "bool",
				"name": "upkeepNeeded",
				"type": "bool"
			},
			{
				"internalType": "bytes",
				"name": "performData",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "fees",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "filterPendingWinningEntriesForUser",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "LotteryIds",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "marketId_",
				"type": "uint256"
			}
		],
		"name": "getAmountsForParticipants",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "marketId_",
				"type": "uint256"
			}
		],
		"name": "getRoundAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "marketId_",
				"type": "uint256"
			}
		],
		"name": "getRoundParticipants",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "marketId_",
				"type": "uint256"
			}
		],
		"name": "getRoundWinner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "getRsp",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "exists",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "response",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "fulfilled",
						"type": "bool"
					}
				],
				"internalType": "struct Lottery.Requests",
				"name": "rsp",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "marketId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "marketIdToCancelled",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "marketIdToExpiration",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "marketIdToRequestId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "marketIdToTotalTickets",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "marketIdToUserToTickets",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "marketIdToWinner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maxEntries",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "requestIdToRequest",
		"outputs": [
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "response",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "fulfilled",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "upkeepSent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
    const contractAddress = '0x9FeE3Fe60CcAa23aa0dE0Cd8bFA22F0d7F802463'
    const provider = ethers.getDefaultProvider('')
    const [initDataSt, setInitData] = useState(null);
    const [initDataUnsafeSt, setInitDataUnsafe] = useState('test');
    const [userId, setUserId] = useState(null)
    const [roundId, setRoundId] = useState(0)
    const [prizePool, setPrizePool] = useState(0)
	const [marketTotalPlayers, setTotalPlayers] = useState(0)
	const [marketToTalTickets, setMarketToTalTickets] = useState(0)
	const [marketUserBet, setUserBet] = useState(0)
	const [marketExpiration, setExpiration] = useState(0)
	const [winningMarkets, setWinningMarkets] = useState([])
	const [userBalance, setUserBalance] = useState(0)
 	const [tickets, setNumberOfTickets] = useState(0)
	const [finalAddress, setFinalAddress] = useState('')
    const [wallet, setWallet] = useState('')
    const [contract, setContract] = useState('')
	const [history, setHistory] = useState([])
	const [pendingTxn, setPendingTxn] = useState(false)

    useEffect(() => {
        const script= document.createElement('script')
        script.src = "https://telegram.org/js/telegram-web-app.js?1"
        document.head.appendChild(script)

        script.onload = () => {
          // Now, you can access window.Telegram.WebApp
          if (window.Telegram && window.Telegram.WebApp) {
            // You can use Telegram.WebApp here
            const initData = window.Telegram.WebApp.initData || 'test';
            const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe || 'test';
            setInitData(initData)
            setInitDataUnsafe(initDataUnsafe)
            if(initData !== 'test'){
                setUserId(initDataUnsafe['user']['id'])
            }
            setUpUser()
          }
        };

    }, [userId]);

    function setUpUser() {
        if (userId !== null) {
            let wl = localStorage.getItem(userId)
            if (wl === null) {
                wl = ethers.Wallet.createRandom(provider)
                localStorage.setItem(userId, wl.signingKey.privateKey)
            } else {
                wl = new ethers.Wallet(wl, provider)
            }
            setWallet(wl)
            setContract(new ethers.Contract(contractAddress, contractAbi, wl.provider))
        }
    }


    async function getRoundInfo() {
        let roundId = await contract.marketId()
        setRoundId(roundId.toString());
        let currentPrizePool = await contract.getRoundAmount(roundId)
        setPrizePool(currentPrizePool.toString())
        let currentPlayers = await contract.getRoundParticipants(roundId)
        setTotalPlayers(currentPlayers.length)
		let userBet = await contract.marketIdToUserToTickets(roundId, wallet.address)
        setUserBet(userBet.toString())
		let expiration = await contract.marketIdToExpiration(roundId)
        setExpiration(parseInt(expiration, 10) - parseInt((Date.now() / 1000)))
		let marketTickets = await contract.marketIdToTotalTickets(roundId)
		setMarketToTalTickets(marketTickets)
		const con = contract.connect(wallet)
		let winningRounds = await con.filterPendingWinningEntriesForUser()
		setWinningMarkets(winningRounds)
		// getUserHistory()
    }

	function removeLeadingZeros(hexString) {
	  const bigNumber = ethers.toBigInt(hexString, 16);
	  const cleanedHexString = '0x' + bigNumber.toString(16);
	  return cleanedHexString;
	}

	async function getUserHistory() {
		let filter = [utils.id('EnteredMarket(uint256,address,uint256)')]
		let rsp = await provider.getLogs({
			fromBlock: 40643648,
			toBlock: 'latest',
			address: contractAddress,
			topics: filter
		})
		let eventBody = []
		let finalBody = []
		rsp.map(ev => {
			const eventAddress = removeLeadingZeros(ev.topics[2]).toLowerCase()
			if (eventAddress === wallet.address.toLowerCase() && !eventBody.includes(ethers.toBigInt(ev.topics[1]))) {
				eventBody.push(ethers.toBigInt(ev.topics[1]))
				return 1
			}
		})
		eventBody = eventBody.slice().reverse();
		eventBody.map(async roundI => {
			let currentPrizePool = await contract.getRoundAmount(roundI)
			let currentPlayers = await contract.getRoundParticipants(roundI)
			let userBet = await contract.marketIdToUserToTickets(roundI, wallet.address)
			let marketTickets = await contract.marketIdToTotalTickets(roundI)
			let winner = await contract.getRoundWinner(roundI)
			finalBody.push([roundI, currentPrizePool, currentPlayers.length, userBet, winner, marketTickets])
		})
		console.log(finalBody)
		setHistory(finalBody)
	}


	async function getBalance(){
		setUserBalance(await provider.getBalance(wallet.address))
	}
	const handleInputChange = (e) => {
		const inputValue = e.target.value;
		if (/^\d*$/.test(inputValue) || inputValue === '') {
		  setNumberOfTickets(inputValue);
		}
  	};

	const handleAddressChange = (e) => {
		const inputValue = e.target.value;
		try {
			setFinalAddress(ethers.getAddress(inputValue))
		} catch(error) {
			setFinalAddress('INVALID')
		}
  	};

	const copyToClipboard = () => {
		if (wallet !== '') {
		  navigator.clipboard.writeText(wallet.address)
			.then(() => {
			  // Clipboard write succeeded
			  alert('Copied to clipboard: ' + wallet.address);
			})
			.catch((error) => {
			  // Clipboard write failed
			  console.error('Clipboard copy failed: ', error);
			});
		}
  	};

	async function enterRound() {
		const con = contract.connect(wallet)
		const nonce = await provider.getTransactionCount(wallet.address)
		const gasPrice = (await provider.getFeeData()).gasPrice
		setPendingTxn(true)
		const txn = await con.enterMarket({
			value: ethers.parseEther((tickets * 0.001).toString()),
			nonce: nonce,
			gasPrice: gasPrice
		})
		const rsp = await provider.waitForTransaction(txn.hash, 1);
		setPendingTxn(false)
		console.log(rsp)
	}

	async function claimWinnings() {
		for (let i = 0; i<winningMarkets.length; i++) {
			const con = contract.connect(wallet)
			const nonce = await provider.getTransactionCount(wallet.address)
			setPendingTxn(true)
			const roundStatus = await con.marketIdToCancelled(winningMarkets[i])
			console.log(roundStatus)
			if (roundStatus === 0) {
				const gasPrice = (await provider.getFeeData()).gasPrice
				const txn = await con.claimWinnings(winningMarkets[i],{
					nonce: nonce,
					gasPrice: gasPrice})
				const rsp = await provider.waitForTransaction(txn.hash, 1);
				setPendingTxn(false)
				console.log(rsp)
			}else {
				const gasPrice = (await provider.getFeeData()).gasPrice
				const txn = await con.redeemCancelled(winningMarkets[i],{
					nonce: nonce,
					gasPrice: gasPrice})
				const rsp = await provider.waitForTransaction(txn.hash, 1);
				setPendingTxn(false)
				console.log(rsp)
			}

		}
	}

	async function withdraw() {
		const gas = await provider.getFeeData()
		const nonce = await provider.getTransactionCount(wallet.address)
		const amount = toBigInt(userBalance) - toBigInt(gas.gasPrice * toBigInt(21000))
		setPendingTxn(true)
		const txn = await wallet.sendTransaction({to: finalAddress, value: amount, nonce: nonce})
		const rsp = await provider.waitForTransaction(txn.hash, 1);
		setPendingTxn(false)
	}

    useEffect(() => {
        console.log(contract)
        if (contract !== '') {
            getRoundInfo()
        }
    }, [contract])

	useEffect(() => {
		if (marketExpiration > 0) {
			getBalance()
			const intervalID = setInterval(() => {
				setExpiration((preExpiration) => preExpiration - 1);
			}, 1000); // Update the timer every 1000 milliseconds (1 second)
			// Cleanup: Clear the interval when the component unmounts
			return () => {
				clearInterval(intervalID);
			};
		}
  	}, [marketExpiration]);


    return (
        <div className="App">
          <header className="App-header">
            <div className="small-text" onClick={copyToClipboard}>
                {wallet !== '' ? 'User address: ' + wallet.address : 'Invalid'}
            </div>
			<div className="small-text">
                {wallet !== '' ? 'User balance: ' + ethers.formatEther(userBalance) : 'Invalid'}
            </div>
            <div className="small-text">
                <div>Round id: {roundId}</div>
                <div>Prize pool: {prizePool}</div>
				<div>Current players: {marketTotalPlayers}</div>
                <div>My entries: {marketUserBet}</div>
				<div>My win chance: {(prizePool !== 0 && prizePool !== '0') ? (parseInt(marketUserBet, 10) / parseInt(marketToTalTickets, 10)).toString() : '0'}</div>
                <div>Time left: {marketExpiration > 0 ? marketExpiration.toString() : 'Pending resolution'}</div>
				<div>Ticket Price: 0.001 Ether</div>
				{winningMarkets.length > 0 ? <div>
					<div>Pending Winning Round Ids: {winningMarkets.toString()}</div>
					<button onClick={claimWinnings} style={{
						  width: '70px', // Set the width to your desired size
						  height: '30px', // Set the height to your desired size
						  fontSize: '14px', // Set the font size to your desired size
						  fontWeight: 'bold', // Make the placeholder text bold
						  font: 'black', // Set the text color to black
				  }}>Claim</button>
				</div> : <div></div>}
            </div>
			{roundId !== 0 && roundId !== '0' ? <div>
				<input type="text" onChange={handleInputChange}  placeholder="Tickets"
					   style={{
						  width: '70px', // Set the width to your desired size
						  height: '30px', // Set the height to your desired size
						  fontSize: '14px', // Set the font size to your desired size
						  fontWeight: 'bold', // Make the placeholder text bold
						  font: 'black', // Set the text color to black
						  marginRight: '5px'
					   }}
				/>
				  {ethers.parseEther((tickets * 0.001).toString()) < userBalance && !pendingTxn ? <button onClick={enterRound} style={{
						  width: '70px', // Set the width to your desired size
						  height: '30px', // Set the height to your desired size
						  fontSize: '14px', // Set the font size to your desired size
						  fontWeight: 'bold', // Make the placeholder text bold
						  font: 'black', // Set the text color to black
				  }}>Enter</button> : <div> </div>}
			</div> : <div></div>}
			{userBalance != 0 && !pendingTxn ? <div>
				<input type="text" onChange={handleAddressChange}  placeholder="Withdraw address"
					   style={{
						  width: '140px', // Set the width to your desired size
						  height: '30px', // Set the height to your desired size
						  fontSize: '14px', // Set the font size to your desired size
						  fontWeight: 'bold', // Make the placeholder text bold
						  font: 'black', // Set the text color to black
						  marginRight: '5px'
					   }}
				/>
				{finalAddress !== 'INVALID' ? <button onClick={withdraw} style={{
						  width: '70px', // Set the width to your desired size
						  height: '30px', // Set the height to your desired size
						  fontSize: '14px', // Set the font size to your desired size
						  fontWeight: 'bold', // Make the placeholder text bold
						  font: 'black', // Set the text color to black
				}}>Withdraw</button> : <div></div>}
			</div> : <div></div>}
			  <button onClick={getUserHistory}>Get history</button>
			  {history.length > 0 ?
				  <div> History: {history.map((event, i) => (
						  <div key={i} style={{
							  width: '300px',
							  height: '150px',
							  marginBottom: '5px'
						  }}>
							  <div className="small-text">RoundId: {event[0].toString()}  </div>
							  <div className="small-text">PrizePool: {event[1].toString()}  </div>
							  <div className="small-text">Total participants: {event[2].toString()}  </div>
							  <div className="small-text">Your tickets: {event[3].toString()}</div>
							  <div className="small-text">Winner: <div>{event[4].toString()}</div></div>
							  <div className="small-text">Total tickets: {event[5].toString()}</div>

						  </div>
					  ))}
				  </div> :
				  <div> No history</div>}
          </header>
        </div>
    );
}

export default App;