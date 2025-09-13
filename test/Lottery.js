const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const {ethers} = require("hardhat");

describe("VOWin", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMockVrfAndLotteryFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const VRF = await ethers.getContractFactory('VRFCoordinatorV2Mock');
    const vrf = await VRF.deploy(100000000000000000n, 1000000000n)
    await vrf.createSubscription()
    await vrf.fundSubscription(1, 10000000000000000000000n)
    const VOWin = await ethers.getContractFactory('VOWin');
    const vowin = await VOWin.deploy(await vrf.getAddress())
    await vrf.addConsumer(1, await vowin.getAddress())
    await vowin.initialise(owner.address, '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', 1000)
    return { vowin, vrf };
  }

  describe("VOWinE2E", function () {
    it("E2E round 50 entries ", async function () {
      const { vowin, vrf } = await loadFixture(deployMockVrfAndLotteryFixture);
      const users = []
      const signers = await ethers.getSigners()
      for(let i= 0; i < signers.length; i++) {
        users.push(signers[i])
      }
      for (let i = 0 ; i< 30; i++){
        const new_user = ethers.Wallet.createRandom(ethers.provider)
        await users[i%20].sendTransaction({to: new_user.address, value: ethers.parseEther("1505")})
        users.push(new_user)
      }
      const min = 0.01;
      const max = 15.0;
      for (let round = 0; round < 100; round++) {
        for (let i = 0; i < users.length; i++) {
          const randomFloat = Math.random() * (max - min) + min;
          await expect(vowin.connect(users[i]).enterRound({'value': ethers.parseEther(randomFloat.toString())})).to.emit(vowin, 'EnteredRound').withArgs(round+1, users[i].address, ethers.parseEther(randomFloat.toString()))
        }
        const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        await time.increaseTo(expiration)
        await vowin.performUpkeep('0x00')
        const requestId = await vowin.roundIdToRequestId(roundId)
        await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
        const winner = await vowin.getRoundWinner(roundId)
        const winnerPreBalance = await ethers.provider.getBalance(winner)
        for (let i = 0; i < users.length; i++) {
          if (users[i].address === winner) {
            let value;
            if ((totalTickets - (totalTickets * 1000n / 10000n)) % 1n === 0n) {
              value = totalTickets - (totalTickets * 1000n / 10000n)
            }else {
              value = totalTickets - (totalTickets * 1000n / 10000n) + 1
            }

            await expect(vowin.connect(users[i]).redeemAllPendingWinnings([roundId])).to.emit(vowin, 'ClaimedWinnings').withArgs(roundId, winner, value)
            break;
          }
        }
        const winnerAfterBalance = await ethers.provider.getBalance(winner)
        const contractBalance = await ethers.provider.getBalance(await vowin.getAddress())
        let fees = await vowin.fees()
        expect(winnerAfterBalance).to.be.greaterThan(winnerPreBalance)
        expect(contractBalance).to.be.equal(totalTickets * 1000n / 10000n)
        expect(contractBalance).to.be.equal(fees)
        await expect(vowin.claimFees()).to.emit(vowin, "ClaimedFees").withArgs(users[0].address, fees)
        fees = await vowin.fees()
        expect(fees).to.equal(0n)
        const rsp = await vowin.getRoundInfo()
        expect(rsp[0]).to.equal(roundId + 1n)
      }
    }).timeout(100000000);
    it("E2E round ", async function () {
      const { vowin, vrf } = await loadFixture(deployMockVrfAndLotteryFixture);
      const users = []
      const signers = await ethers.getSigners()
      for(let i= 0; i < signers.length; i++) {
        users.push(signers[i])
      }
      const min = 0.01;
      const max = 15.0;
      for (let round = 0; round < 100; round++) {
        for (let i = 0; i < signers.length; i++) {
          const randomFloat = Math.random() * (max - min) + min;
          await expect(vowin.connect(users[i]).enterRound({'value': ethers.parseEther(randomFloat.toString())})).to.emit(vowin, 'EnteredRound').withArgs(round+1, users[i].address, ethers.parseEther(randomFloat.toString()))
        }
        const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        await time.increaseTo(expiration)
        await vowin.performUpkeep('0x00')
        const requestId = await vowin.roundIdToRequestId(roundId)
        await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
        const winner = await vowin.getRoundWinner(roundId)
        const winnerPreBalance = await ethers.provider.getBalance(winner)
        for (let i = 0; i < signers.length; i++) {
          if (users[i].address === winner) {
            let value;
            if ((totalTickets - (totalTickets * 1000n / 10000n)) % 1n === 0n) {
              value = totalTickets - (totalTickets * 1000n / 10000n)
            }else {
              value = totalTickets - (totalTickets * 1000n / 10000n) + 1
            }

            await expect(vowin.connect(users[i]).redeemAllPendingWinnings([roundId])).to.emit(vowin, 'ClaimedWinnings').withArgs(roundId, winner, value)
            break;
          }
        }
        const winnerAfterBalance = await ethers.provider.getBalance(winner)
        const contractBalance = await ethers.provider.getBalance(await vowin.getAddress())
        let fees = await vowin.fees()
        expect(winnerAfterBalance).to.be.greaterThan(winnerPreBalance)
        expect(contractBalance).to.be.equal(totalTickets * 1000n / 10000n)
        expect(contractBalance).to.be.equal(fees)
        await expect(vowin.claimFees()).to.emit(vowin, "ClaimedFees").withArgs(users[0].address, fees)
        fees = await vowin.fees()
        expect(fees).to.equal(0n)
        const rsp = await vowin.getRoundInfo()
        expect(rsp[0]).to.equal(roundId + 1n)
      }
    }).timeout(1000000);
    it("E2E round cancel ", async function () {
      const { vowin, vrf } = await loadFixture(deployMockVrfAndLotteryFixture);
      const users = []
      const signers = await ethers.getSigners()
      for(let i= 0; i < signers.length; i++) {
        users.push(signers[i])
      }
      const min = 0.01;
      const max = 10.0;
      for (let round = 0; round < 100; round++) {
        const randomFloat = Math.random() * (max - min) + min;
        await expect(vowin.connect(users[0]).enterRound({'value': ethers.parseEther(randomFloat.toString())})).to.emit(vowin, 'EnteredRound').withArgs(round + 1, users[0].address, ethers.parseEther(randomFloat.toString()))
        const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        await time.increaseTo(expiration)
        await expect(vowin.performUpkeep('0x00')).to.emit(vowin, 'RoundCancelled').withArgs(roundId)
        const userPreBalance = await ethers.provider.getBalance(users[0].address)
        await expect(vowin.redeemAllPendingWinnings([roundId])).to.emit(vowin, 'ClaimedCancelled')
            .withArgs(roundId, users[0].address, ethers.parseEther(randomFloat.toString()))
        const userAfterBalance = await ethers.provider.getBalance(users[0].address)
        const contractBalance = await ethers.provider.getBalance(await vowin.getAddress())
        let fees = await vowin.fees()
        expect(userAfterBalance).to.be.greaterThan(userPreBalance)
        expect(contractBalance).to.be.equal(0n)
        expect(fees).to.equal(0n)
        const rsp = await vowin.getRoundInfo()
        expect(rsp[0]).to.equal(roundId + 1n)
      }
    }).timeout(100000);
    it("E2E round freeze", async function () {
      const { vowin, vrf } = await loadFixture(deployMockVrfAndLotteryFixture);
      const users = []
      const signers = await ethers.getSigners()
      for(let i= 0; i < signers.length; i++) {
        users.push(signers[i])
      }
      const min = 0.01;
      const max = 15.0;
      for (let round = 0; round < 100; round++) {
        const inputs = [];
        let [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        for (let i = 0; i < signers.length; i++) {
          const randomFloat = Math.random() * (max - min) + min;
          await expect(vowin.connect(users[i]).enterRound({'value': ethers.parseEther(randomFloat.toString())})).to.emit(vowin, 'EnteredRound').withArgs(roundId, users[i].address, ethers.parseEther(randomFloat.toString()))
          inputs.push(randomFloat)
        }
        [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        // Path 1 : freeze before expiration
        // Path 2: freeze after upkeep before vrf response
        // Path 3: freeze after vrf response
        if (round % 3 === 0) {
          await vowin.freezeContract()
        }else if (round % 3 === 1) {
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
          await vowin.freezeContract()
          const requestId = await vowin.roundIdToRequestId(roundId)
          await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
        } else {
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
          const requestId = await vowin.roundIdToRequestId(roundId)
          await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
          await vowin.freezeContract()
          const winner = await vowin.getRoundWinner(roundId)
          const winnerPreBalance = await ethers.provider.getBalance(winner)
          for (let i = 0; i < signers.length; i++) {
            if (users[i].address === winner) {
              let value;
              if ((totalTickets - (totalTickets * 1000n / 10000n)) % 1n === 0n) {
                value = totalTickets - (totalTickets * 1000n / 10000n)
              }else {
                value = totalTickets - (totalTickets * 1000n / 10000n) + 1
              }

              await expect(vowin.connect(users[i]).redeemAllPendingWinnings([roundId])).to.emit(vowin, 'ClaimedWinnings').withArgs(roundId, winner, value)
              break;
            }
          }
          const winnerAfterBalance = await ethers.provider.getBalance(winner)
          expect(winnerAfterBalance).to.be.greaterThan(winnerPreBalance)
          const contractBalance = await ethers.provider.getBalance(await vowin.getAddress())
          let fees = await vowin.fees()
          expect(contractBalance).to.be.equal(totalTickets * 1000n / 10000n)
          expect(contractBalance).to.be.equal(fees)
          await expect(vowin.claimFees()).to.emit(vowin, "ClaimedFees").withArgs(users[0].address, fees)
          fees = await vowin.fees()
          expect(fees).to.equal(0n)
          roundId += 1n;
        }
        if(round % 3 !== 2) {
          for (let i = 0; i < signers.length; i++) {
            await expect(vowin.connect(users[i]).redeemAllPendingWinnings([roundId])).to.emit(vowin, 'ClaimedCancelled').withArgs(roundId, users[i].address, ethers.parseEther(inputs[i].toString()))
          }
        }
        await vowin.unfreezeContract()
      }
    }).timeout(1000000);
  });
  describe("VOWin unit testing", function () {
    describe("Enter round", function () {
      it("Contract should lock on 50 entrants", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = []
        const deployer = (await ethers.getSigners())[0]
        for (let i = 0; i < 50; i++) {
          let wallet = ethers.Wallet.createRandom(ethers.provider)
          await deployer.sendTransaction({value: ethers.parseEther("0.1"), to: wallet.address})
          users.push(wallet)
          await expect(vowin.connect(wallet).enterRound({value: ethers.parseEther("0.07")})).to.emit(vowin, "EnteredRound")
              .withArgs(1n, wallet.address, ethers.parseEther("0.07"))
        }
        expect((await vowin.getRoundParticipants(1)).length).to.equal(50)
        await expect(vowin.enterRound({value: ethers.parseEther("0.07")})).to.be.revertedWith('MER')
      });
      it("Should revert with cf when contract frozen", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        await vowin.freezeContract()
        await expect(vowin.enterRound({value: ethers.parseEther("0.07")})).to.be.revertedWith("CF")
      });
      it("Should revert with NVV when below min value", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        await expect(vowin.enterRound({value: 7})).to.be.revertedWith("NVV")
      });
      it("Should revert with NVT when entering after expiration", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        await time.increaseTo(expiration)
        await expect(vowin.enterRound({value: ethers.parseEther("0.07")})).to.be.revertedWith("NVT")
      });

    });
    describe("Claim winnings", function () {
      it("Contract should revert with NVS if not correct caller", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = await ethers.getSigners()
        for (let i = 0; i < 5; i++) {
          await expect(vowin.connect(users[i]).enterRound({value: ethers.parseEther("0.07")})).to.emit(vowin, "EnteredRound")
              .withArgs(1n, users[i].address, ethers.parseEther("0.07"))
        }
        const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        await time.increaseTo(expiration)
        await vowin.performUpkeep('0x00')
        const requestId = await vowin.roundIdToRequestId(roundId)
        await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
        const winner = await vowin.getRoundWinner(1)
        if (winner !== users[0].address) {
          await expect(vowin.claimWinnings(1)).to.be.revertedWith('NVS')
        } else {
          await expect(vowin.connect(userw[1]).claimWinnings(1)).to.be.revertedWith('NVS')
        }
      });
      it("Should revert with AR when try to reredeem", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = await ethers.getSigners()
        for (let i = 0; i < 2; i++) {
          await expect(vowin.connect(users[i]).enterRound({value: ethers.parseEther("0.07")})).to.emit(vowin, "EnteredRound")
              .withArgs(1n, users[i].address, ethers.parseEther("0.07"))
        }
        const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        await time.increaseTo(expiration)
        await vowin.performUpkeep('0x00')
        const requestId = await vowin.roundIdToRequestId(roundId)
        await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
        const winner = await vowin.getRoundWinner(1)
        if (winner === users[0].address) {
          await vowin.claimWinnings(1)
          await expect(vowin.claimWinnings(1)).to.be.revertedWith('AR')
        } else {
          await vowin.connect(users[1]).claimWinnings(1)
          await expect(vowin.connect(userw[1]).claimWinnings(1)).to.be.revertedWith('AR')
        }
      });
    });
    describe("Redeem Cancelled", function () {
      it("Contract should revert with NC if not cancelled", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = await ethers.getSigners()
        for (let i = 0; i < 5; i++) {
          await expect(vowin.connect(users[i]).enterRound({value: ethers.parseEther("0.07")})).to.emit(vowin, "EnteredRound")
              .withArgs(1n, users[i].address, ethers.parseEther("0.07"))
        }
        const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        await time.increaseTo(expiration)
        await vowin.performUpkeep('0x00')
        const requestId = await vowin.roundIdToRequestId(roundId)
        await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
        await expect(vowin.redeemCancelled(1)).to.be.revertedWith('NC')
      });
      it("Should send 0 value if try to reredeem cancelled round", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = await ethers.getSigners()
        await expect(vowin.enterRound({value: ethers.parseEther("0.07")})).to.emit(vowin, "EnteredRound")
              .withArgs(1n, users[0].address, ethers.parseEther("0.07"))
        const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        await time.increaseTo(expiration)
        await vowin.performUpkeep('0x00')
        await vowin.redeemCancelled(1)
        await expect(vowin.redeemCancelled(1)).to.emit(vowin, 'ClaimedCancelled').withArgs(1n, users[0].address, 0)
      });
    });
    describe("Redeem all pending winnings", function () {
      it("Cant't reredeem through redeemAllPendingWinnings", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = await ethers.getSigners()
        for (let i = 0; i < 2; i++) {
          await expect(vowin.connect(users[i]).enterRound({value: ethers.parseEther("0.01")})).to.emit(vowin, "EnteredRound")
              .withArgs(1n, users[i].address, ethers.parseEther("0.01"))
        }
        const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
        await time.increaseTo(expiration)
        await vowin.performUpkeep('0x00')
        const requestId = await vowin.roundIdToRequestId(roundId)
        await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
        await vowin.enterRound({value: ethers.parseEther("0.07")})
        const [roundId2, totalTickets2, expiration2, participants2, amounts2] = await vowin.getRoundInfo()
        await time.increaseTo(expiration2)
        await vowin.performUpkeep('0x00')
        const winner = await vowin.getRoundWinner(1)
        if (winner !== users[0].address) {
          await expect(vowin.connect(users[1]).redeemAllPendingWinnings([1])).to.emit(vowin, 'ClaimedWinnings').withArgs(1, users[1].address, (totalTickets - totalTickets*1000/10000))
          await expect(vowin.connect(users[1]).redeemAllPendingWinnings([1])).to.not.emit(vowin, 'ClaimedWinnings')
          await expect(vowin.redeemAllPendingWinnings([2])).to.emit(vowin, 'ClaimedCancelled').withArgs(2, users[0].address, ethers.parseEther("0.07"))
          await expect(vowin.redeemAllPendingWinnings([2])).to.not.emit(vowin, 'ClaimedCancelled')
        } else {
            let redeemTxn = await vowin.redeemAllPendingWinnings([1, 2])
            await expect(redeemTxn).to.emit(vowin, 'ClaimedWinnings')
            await expect(redeemTxn).to.emit(vowin, 'ClaimedCancelled')
            redeemTxn = await vowin.redeemAllPendingWinnings([1, 2])
            await expect(redeemTxn).to.not.emit(vowin, 'ClaimedWinnings')
            await expect(redeemTxn).to.not.emit(vowin, 'ClaimedCancelled')
        }
      });
      it("Multi redeem cancel through redeemAllPendingWinnings", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = await ethers.getSigners()
        const rounds = []
        for (let i = 0; i < 100; i++) {
          await vowin.enterRound({value: ethers.parseEther("0.01")})
          const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
          rounds.push(roundId)
        }
        const userPreBalance = await ethers.provider.getBalance(users[0])
        let redeemAll = await vowin.redeemAllPendingWinnings(rounds)
        for (let i = 0; i < 100; i++) {
          await expect(redeemAll).to.emit(vowin, 'ClaimedCancelled').withArgs(rounds[i], users[0].address, ethers.parseEther('0.01'))
        }
        const userAfterBalance = await ethers.provider.getBalance(users[0])
        await expect(userAfterBalance).to.be.greaterThan(userPreBalance)
        console.log(userAfterBalance, userPreBalance)
        redeemAll = await vowin.redeemAllPendingWinnings(rounds)
        await expect(redeemAll).to.not.emit(vowin, 'ClaimedCancelled')
      });
      it("Multi redeem winnings through redeemAllPendingWinnings", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = await ethers.getSigners()
        const rounds = []
        for (let i = 0; i < 5; i++) {
          await vowin.enterRound({value: ethers.parseEther("10")})
          await vowin.connect(users[1]).enterRound({value: ethers.parseEther("0.01")})
          const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
          const requestId = await vowin.roundIdToRequestId(roundId)
          await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
          rounds.push(roundId)
        }
        const userPreBalance = await ethers.provider.getBalance(users[0])
        let redeemAll = await vowin.redeemAllPendingWinnings(rounds)
        for (let i = 0; i < 5; i++) {
          await expect(redeemAll).to.emit(vowin, 'ClaimedWinnings').withArgs(rounds[i], users[0].address, ethers.parseEther('9.009'))
        }
        const userAfterBalance = await ethers.provider.getBalance(users[0])
        await expect(userAfterBalance).to.be.greaterThan(userPreBalance)
        redeemAll = await vowin.redeemAllPendingWinnings(rounds)
        await expect(redeemAll).to.not.emit(vowin, 'ClaimedWinnings')
      });
      it("Multi redeem through redeemAllPendingWinnings", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = await ethers.getSigners()
        const rounds = []
        for (let i = 0; i < 6; i++) {
          await vowin.enterRound({value: ethers.parseEther("10")})
          if (i !== 5) {
            await vowin.connect(users[1]).enterRound({value: ethers.parseEther("0.01")})
          }
          const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
          if (i !== 5) {
            const requestId = await vowin.roundIdToRequestId(roundId)
            await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
          }
          rounds.push(roundId)
        }
        const userPreBalance = await ethers.provider.getBalance(users[0])
        let redeemAll = await vowin.redeemAllPendingWinnings(rounds)
        for (let i = 0; i < 5; i++) {
          await expect(redeemAll).to.emit(vowin, 'ClaimedWinnings').withArgs(rounds[i], users[0].address, ethers.parseEther('9.009'))
        }
        await expect(redeemAll).to.emit(vowin, 'ClaimedCancelled').withArgs(rounds[5], users[0].address, ethers.parseEther('10'))
        const userAfterBalance = await ethers.provider.getBalance(users[0])
        await expect(userAfterBalance).to.be.greaterThan(userPreBalance)
        redeemAll = await vowin.redeemAllPendingWinnings(rounds)
        await expect(redeemAll).to.not.emit(vowin, 'ClaimedWinnings')
        await expect(redeemAll).to.not.emit(vowin, 'ClaimedCancelled')
      });
    });
    describe("Admin actions", function () {
      describe("Claim fees", function () {
        it("Fees reset after claim", async function () {
          const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
          const users = await ethers.getSigners()
          for (let i = 0; i < 2; i++) {
            await expect(vowin.connect(users[i]).enterRound({value: ethers.parseEther("0.01")})).to.emit(vowin, "EnteredRound")
                .withArgs(1n, users[i].address, ethers.parseEther("0.01"))
          }
          const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
          const requestId = await vowin.roundIdToRequestId(roundId)
          await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
          const winner = await vowin.getRoundWinner(1)
          if (winner === users[0].address) {
            await vowin.claimWinnings(1)
          } else {
            await vowin.connect(users[1]).claimWinnings(1)
          }
          await expect(vowin.claimFees()).to.emit(vowin, 'ClaimedFees').withArgs(users[0].address, ethers.parseEther("0.02") * 1000n/10000n)
          expect(await vowin.fees()).to.equal(0n)
        });
      });
      describe("Change minimum entrance value", function () {
        it("Should revert with NVS if not admin called", async function () {
          const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
          const users = await ethers.getSigners()
          await expect(vowin.connect(users[1]).changeMinValue(100)).to.revertedWith('NVS')
        });
        it("Should change the minimum value", async function () {
          const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
          await vowin.changeMinValue(100)
          expect(await vowin.minimumValue()).to.be.equal(100n)
        });
      });
      describe("Freeze/Unfreeze contract", function () {
        it("Should revert with NVS if not admin called", async function () {
          const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
          const users = await ethers.getSigners()
          await expect(vowin.connect(users[1]).freezeContract()).to.revertedWith('NVS')
          await expect(vowin.connect(users[1]).unfreezeContract()).to.revertedWith('NVS')
        });
        it("Should freeze/unfreeze the contract", async function () {
          const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
          await vowin.freezeContract()
          await vowin.unfreezeContract()
        });
      });
      describe("Change max entries", function () {
        it("Should revert with NVS if not admin called", async function () {
          const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
          const users = await ethers.getSigners()
          await expect(vowin.connect(users[1]).changeMaxEntries(100)).to.revertedWith('NVS')
        });
        it("Should change max entries", async function () {
          const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
          await vowin.changeMaxEntries(100)
          expect(await vowin.maxEntries()).to.equal(100n)
        });
      });
    });
  });
  describe("View functions", function () {
    it("getHistoryWithPagination", async function () {
      const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
      const users = []
      const signers = await ethers.getSigners()
      for (let i = 0; i < signers.length; i++) {
        users.push(signers[i])
      }
      const min = 0.01;
      const max = 15.0;
      for (let round = 0; round < 1000; round++) {
        if (round % 4 !== 0) {
          for (let i = 0; i < signers.length; i++) {
            const randomFloat = Math.random() * (max - min) + min;
            await expect(vowin.connect(users[i]).enterRound({'value': ethers.parseEther(randomFloat.toString())})).to.emit(vowin, 'EnteredRound').withArgs(round + 1, users[i].address, ethers.parseEther(randomFloat.toString()))
          }
          const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
          const requestId = await vowin.roundIdToRequestId(roundId)
          await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
          const winner = await vowin.getRoundWinner(roundId)
          const winnerPreBalance = await ethers.provider.getBalance(winner)
          for (let i = 0; i < signers.length; i++) {
            if (users[i].address === winner) {
              let value;
              if ((totalTickets - (totalTickets * 1000n / 10000n)) % 1n === 0n) {
                value = totalTickets - (totalTickets * 1000n / 10000n)
              } else {
                value = totalTickets - (totalTickets * 1000n / 10000n) + 1
              }

              await expect(vowin.connect(users[i]).redeemAllPendingWinnings([roundId])).to.emit(vowin, 'ClaimedWinnings').withArgs(roundId, winner, value)
              break;
            }
          }
          const winnerAfterBalance = await ethers.provider.getBalance(winner)
          const contractBalance = await ethers.provider.getBalance(await vowin.getAddress())
          let fees = await vowin.fees()
          expect(winnerAfterBalance).to.be.greaterThan(winnerPreBalance)
          expect(contractBalance).to.be.equal(totalTickets * 1000n / 10000n)
          expect(contractBalance).to.be.equal(fees)
          await expect(vowin.claimFees()).to.emit(vowin, "ClaimedFees").withArgs(users[0].address, fees)
          fees = await vowin.fees()
          expect(fees).to.equal(0n)
          const rsp = await vowin.getRoundInfo()
          expect(rsp[0]).to.equal(roundId + 1n)
        } else {
          const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
        }
      }
        const history = await vowin.getHistoryWithPagination(1000, 500)
        const history2 = await vowin.getHistoryWithPagination(500, 500)

        expect(history.length).to.be.equal(500)
        expect(history[0][0]).to.be.equal(1000n)
        expect(history[499][0]).to.be.equal(501n)
        expect(history2.length).to.be.equal(500)
        expect(history2[0][0]).to.be.equal(500n)
        expect(history2[499][0]).to.be.equal(1n)
      }).timeout(1000000);
    it("getCompletedHistoryWithPagination", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const users = []
        const signers = await ethers.getSigners()
        for (let i = 0; i < signers.length; i++) {
          users.push(signers[i])
        }
        for (let round = 0; round < 2000; round++) {
            for (let i = 0; i < signers.length; i++) {
              await vowin.connect(users[i]).enterRound({'value': ethers.parseEther('0.01')})
            }
            const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
            await time.increaseTo(expiration)
            await vowin.performUpkeep('0x00')
            const requestId = await vowin.roundIdToRequestId(roundId)
            await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
        }
        const history = await vowin.getCompletedHistoryWithPagination(0, 1500)
        const history2 = await vowin.getCompletedHistoryWithPagination(1500, 1000)
        expect(history.length).to.be.equal(1500)
        expect(history2.length).to.be.equal(500)

        expect(history[0][0]).to.be.equal(1n)
        expect(history[1499][0]).to.be.equal(1500n)

        expect(history2[0][0]).to.be.equal(1501n)
        expect(history2[499][0]).to.be.equal(2000n)
      }).timeout(100000000);
    it("getCancelledHistoryWithPagination", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        for (let round = 0; round < 2500; round++) {
          await vowin.enterRound({'value': ethers.parseEther('0.001')})
          const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
        }
        const history = await vowin.getCancelledHistoryWithPagination(0, 2000)
        const history2 = await vowin.getCancelledHistoryWithPagination(2000, 1000)
        expect(history.length).to.be.equal(2000)
        expect(history2.length).to.be.equal(500)

        expect(history[0][0]).to.be.equal(1n)
        expect(history[1999][0]).to.be.equal(2000n)

        expect(history2[0][0]).to.be.equal(2001)
        expect(history2[499][0]).to.be.equal(2500n)
      }).timeout(1000000);
    it("getUsersLastRoundsEntered", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const signers = await ethers.getSigners()
        for (let round = 0; round < 4000; round++) {
            await vowin.enterRound({'value': ethers.parseEther('0.001')})
            if(round % 4 === 0) {
              await vowin.connect(signers[1]).enterRound({'value': ethers.parseEther('0.001')})
            }
            const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
            await time.increaseTo(expiration)
            await vowin.performUpkeep('0x00')
            if(round % 4 === 0) {
              const requestId = await vowin.roundIdToRequestId(roundId)
              await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
            }
        }
        const [completed, cancelled] = await vowin.getUsersLastRoundsEntered(signers[0].address, 1500)
        expect(completed.length).to.be.equal(375)
        expect(cancelled.length).to.be.equal(1125)
      }).timeout(1000000);
    it("getUsersLastRoundsEntered less than limit", async function () {
        const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
        const signers = await ethers.getSigners()
        for (let round = 0; round < 100; round++) {
            await vowin.enterRound({'value': ethers.parseEther('0.001')})
            if(round % 4 === 0) {
              await vowin.connect(signers[1]).enterRound({'value': ethers.parseEther('0.001')})
            }
            const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
            await time.increaseTo(expiration)
            await vowin.performUpkeep('0x00')
            if(round % 4 === 0) {
              const requestId = await vowin.roundIdToRequestId(roundId)
              await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
            }
        }
        const [completed, cancelled] = await vowin.getUsersLastRoundsEntered(signers[0].address, 1500)
        expect(completed.length).to.be.equal(25)
        expect(cancelled.length).to.be.equal(75)
      }).timeout(1000000);
    it("filterPendingWinningEntriesForUser", async function () {
      const {vowin, vrf} = await loadFixture(deployMockVrfAndLotteryFixture);
      const users = []
      const signers = await ethers.getSigners()
      for (let i = 0; i < signers.length; i++) {
        users.push(signers[i])
      }
      const min = 0.01;
      const max = 15.0;
      const win_rounds = [];
      for (let round = 0; round < 100; round++) {
        if (round % 4 !== 0) {
          for (let i = 0; i < signers.length; i++) {
            const randomFloat = Math.random() * (max - min) + min;
            await expect(vowin.connect(users[i]).enterRound({'value': ethers.parseEther(randomFloat.toString())})).to.emit(vowin, 'EnteredRound').withArgs(round + 1, users[i].address, ethers.parseEther(randomFloat.toString()))
          }
          const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
          const requestId = await vowin.roundIdToRequestId(roundId)
          await vrf.fulfillRandomWords(requestId, await vowin.getAddress())
          const winner = await vowin.getRoundWinner(roundId)
          if(winner === users[0].address) {
            win_rounds.push(roundId)
          }
        } else {
          const [roundId, totalTickets, expiration, participants, amounts] = await vowin.getRoundInfo()
          await vowin.enterRound({'value': ethers.parseEther('1')})
          await time.increaseTo(expiration)
          await vowin.performUpkeep('0x00')
          win_rounds.push(roundId)
        }
      }
      const winning_rounds = (await vowin.filterPendingWinningEntriesForUser(0, 2000))[0]
      expect(winning_rounds.length).to.be.equal(win_rounds.length)
      expect(...winning_rounds).to.be.equal(...win_rounds)
    }).timeout(1000000);
  });
});
