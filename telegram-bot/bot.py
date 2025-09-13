import asyncio
import json
import logging
import time
import re
from typing import Tuple, Dict, Any

import telegram
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, ConversationHandler, MessageHandler, CallbackQueryHandler, filters
from web3 import Web3


logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
user_info = {}
w3 = Web3(Web3.HTTPProvider(""))
contract_address = '0x189b1a6cfc1CF33d60CAdd73C1998D3df1Fb1657'
contract_abi = [
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
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "Operator",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "Amount",
                "type": "uint256"
            }
        ],
        "name": "ClaimedFees",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "uint256",
                "name": "MarketId",
                "type": "uint256"
            },
            {
                "indexed": True,
                "internalType": "address",
                "name": "User",
                "type": "address"
            },
            {
                "indexed": False,
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
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "uint256",
                "name": "MarketId",
                "type": "uint256"
            },
            {
                "indexed": True,
                "internalType": "address",
                "name": "User",
                "type": "address"
            },
            {
                "indexed": False,
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
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "uint256",
                "name": "RequestId",
                "type": "uint256"
            },
            {
                "indexed": False,
                "internalType": "uint256[]",
                "name": "RandomWords",
                "type": "uint256[]"
            }
        ],
        "name": "RequestFulfilled",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "uint256",
                "name": "RequestId",
                "type": "uint256"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "NumOfWords",
                "type": "uint256"
            }
        ],
        "name": "RequestSent",
        "type": "event"
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
win_contract_obj = w3.eth.contract(address=contract_address, abi=contract_abi)


# State definitions for top level conversation
SELECTING_ACTION, CURRENT_ROUND, CLAIM_WINNINGS, DEPOSIT, WITHDRAW, HISTORY, SETTINGS = map(chr, range(7))
# State definitions for second level conversation
ENTER, QUICK_ENTER, REFRESH, CLAIM = map(chr, range(7, 11))
# State definitions for descriptions conversation
GET_AMOUNT, GET_ADDRESS, PROCESS_ADDRESS, TYPING = map(chr, range(11, 15))
# Meta states
STOPPING, SHOWING = map(chr, range(15, 17))
# Shortcut for ConversationHandler.END
END = ConversationHandler.END

# Different constants for this example
(
    WITHDRAW_ADDRESS,
    START_OVER,
) = map(chr, range(17, 19))

# Top level conversation callbacks
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    buttons = [
        [
            InlineKeyboardButton(text="Current Round", callback_data=str(CURRENT_ROUND)),
            InlineKeyboardButton(text="Claim Winnings", callback_data=str(CLAIM_WINNINGS)),
        ],
        [
            InlineKeyboardButton(text="Deposit", callback_data=str(DEPOSIT)),
            InlineKeyboardButton(text="Withdraw", callback_data=str(WITHDRAW)),
        ],
        [
            InlineKeyboardButton(text="History", callback_data=str(HISTORY)),
            InlineKeyboardButton(text="Settings", callback_data=str(SETTINGS)),
        ],
    ]
    keyboard = InlineKeyboardMarkup(buttons)
    # If we're starting over we don't need to send a new message
    if context.user_data.get(START_OVER):
        await update.callback_query.answer()
        balance = str(round(w3.eth.get_balance(user_info[update.callback_query.message.chat_id].address) / 10**18, 3))
        balance =  re.sub(r'\.', r'\\.', balance)
        text = "Wallet address: " + '`' + user_info[update.callback_query.message.chat_id].address + '`' + "\nBalance: " + balance
        await update.callback_query.edit_message_text(text=text, reply_markup=keyboard, parse_mode="MarkdownV2")
    else:
        await update.message.reply_text(
            "Hello this is PredictionBot by VenueOne."
        )
        if update.message.from_user.id not in user_info.keys():
            await update.message.reply_text(
                "This is your first login. Creating a wallet for you"
            )
            user_info[update.message.from_user.id] = w3.eth.account.create("halalala")
        balance = str(round(w3.eth.get_balance(user_info[update.message.chat_id].address) / 10 ** 18, 3))
        balance = re.sub(r'\.', r'\\.', balance)
        text = "Wallet address: " + '`' + user_info[update.message.from_user.id].address + '`' + "\nBalance: " + balance
        await update.message.reply_text(text=text, reply_markup=keyboard, parse_mode='MarkdownV2')

    context.user_data[START_OVER] = False
    return SELECTING_ACTION
async def select_current_round(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    roundId = win_contract_obj.functions.marketId().call({'from': user_info[update.callback_query.message.chat_id].address})
    current_total_bets = win_contract_obj.functions.getRoundAmount(roundId).call({'from': user_info[update.callback_query.message.chat_id].address})
    total_players_entered = len(win_contract_obj.functions.getRoundParticipants(roundId).call({'from': user_info[update.callback_query.message.chat_id].address}))
    time_remaining = win_contract_obj.functions.marketIdToExpiration(roundId).call({'from': user_info[update.callback_query.message.chat_id].address}) - int(time.time())
    if time_remaining < 0 :
        time_remaining = 0
    text = "Current round: " + str(roundId) +"\nCurrent prize pool: " + str(current_total_bets) + "\nTotal players entered: " + str(total_players_entered) + "\nExpires in : " + str(time_remaining)

    buttons = [
        [
            InlineKeyboardButton(text="Enter", callback_data=str(ENTER)),
            InlineKeyboardButton(text="Quick Enter", callback_data=str(QUICK_ENTER)),
        ],
        [
            InlineKeyboardButton(text="Refresh", callback_data=str(REFRESH)),
            InlineKeyboardButton(text="Back", callback_data=str(END)),
        ],
    ]
    keyboard = InlineKeyboardMarkup(buttons)

    await update.callback_query.answer()
    await update.callback_query.edit_message_text(text=text, reply_markup=keyboard)

    return SELECTING_ACTION
async def enter_round_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    user_balance = "A"
    try:
        user_balance = str(w3.eth.get_balance(user_info[update.callback_query.message.chat_id].address))
    except:
        user_balance = str(w3.eth.get_balance(user_info[update.message.chat_id].address))
    text = "Balance: " + user_balance +"\nType the amount you want to bet, \nmust be multiple of 0.001E"
    buttons = [
        [InlineKeyboardButton(text="Proceed", callback_data=str(GET_AMOUNT))],
        [InlineKeyboardButton(text="Cancel", callback_data=str(END))],
    ]
    keyboard = InlineKeyboardMarkup(buttons)
    try:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text(text=text, reply_markup=keyboard)
    except:
        buttons = [
            [InlineKeyboardButton(text="BACK", callback_data=str(END))],
        ]
        keyboard = InlineKeyboardMarkup(buttons)
        await update.message.reply_text('COMPLETED', reply_markup=keyboard)
        return END
    return GET_AMOUNT
async def quick_enter(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_balance = w3.eth.get_balance(user_info[update.callback_query.message.chat_id].address)
    max_entries = (user_balance // 10**15) - 1
    try:
        if max_entries <= 0:
            buttons = [
                [InlineKeyboardButton(text="BACK", callback_data=str(END))],
            ]
            keyboard = InlineKeyboardMarkup(buttons)
            await update.callback_query.answer()
            await update.callback_query.edit_message_text('Not enough balance', reply_markup=keyboard)
            return SELECTING_ACTION
        transaction ={
            'nonce': w3.eth.get_transaction_count(user_info[update.callback_query.message.chat_id].address),
            'gasPrice': w3.eth.gas_price,
            'from': user_info[update.callback_query.message.chat_id].address,
            'value': max_entries * 10**15
        }
        txn = win_contract_obj.functions.enterMarket().build_transaction(transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, user_info[update.callback_query.message.chat_id].key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        set_currency_txn_receipt = w3.eth.wait_for_transaction_receipt(sent)
        await update.callback_query.message.reply_text('Txn hash: https://mumbai.polygonscan.com/tx/'+str(w3.to_hex(set_currency_txn_receipt['transactionHash'])))
    except Exception as e:
        buttons = [
            [InlineKeyboardButton(text="BACK", callback_data=str(END))],
        ]
        keyboard = InlineKeyboardMarkup(buttons)
        await update.callback_query.answer()
        await update.callback_query.edit_message_text(str(e), reply_markup=keyboard)
        return SELECTING_ACTION
    buttons = [
        [InlineKeyboardButton(text="BACK", callback_data=str(END))],
    ]
    keyboard = InlineKeyboardMarkup(buttons)
    await update.callback_query.answer()
    await update.callback_query.message.reply_text('COMPLETED', reply_markup=keyboard)
    return SELECTING_ACTION
async def claim_pending_winnings(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    market_winnings = win_contract_obj.functions.filterPendingWinningEntriesForUser().call({'from': user_info[update.callback_query.message.chat_id].address})
    buttons = [
        [
            InlineKeyboardButton(text="Claim", callback_data=str(CLAIM)),
        ],
        [
            InlineKeyboardButton(text="Refresh", callback_data=str(REFRESH)),
        ],
        [
            InlineKeyboardButton(text="Back", callback_data=str(END)),
        ],
    ]
    keyboard = InlineKeyboardMarkup(buttons)

    await update.callback_query.answer()
    await update.callback_query.edit_message_text(text='Pending winning marketIds: ' + str(market_winnings), reply_markup=keyboard)
    return SELECTING_ACTION
async def claim(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    total_winnings = 0
    market_winnings = win_contract_obj.functions.filterPendingWinningEntriesForUser().call({'from': user_info[update.callback_query.message.chat_id].address})
    if len(market_winnings) > 0:
        for market_id in market_winnings:
            transaction = {
                'nonce': w3.eth.get_transaction_count(user_info[update.callback_query.message.chat_id].address),
                'gasPrice': w3.eth.gas_price,
                'from': user_info[update.callback_query.message.chat_id].address,
            }
            txn = win_contract_obj.functions.claimWinnings(market_id).build_transaction(transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, user_info[update.callback_query.message.chat_id].key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            set_currency_txn_receipt = w3.eth.wait_for_transaction_receipt(sent)
            total_winnings += (w3.to_int(set_currency_txn_receipt['logs'][0]['data']))
    buttons = [
        [
            InlineKeyboardButton(text="Back", callback_data=str(END)),
        ],
    ]
    keyboard = InlineKeyboardMarkup(buttons)
    await update.callback_query.answer()
    await update.callback_query.edit_message_text(text='Claimed ' + str(total_winnings),
                                                  reply_markup=keyboard)
    return SELECTING_ACTION
async def deposit(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    buttons = [
        [
            InlineKeyboardButton(text="Back", callback_data=str(END)),
        ],
    ]
    keyboard = InlineKeyboardMarkup(buttons)
    await update.callback_query.answer()
    await update.callback_query.edit_message_text(
        '`' + user_info[update.callback_query.message.chat_id].address + '`',
        reply_markup = keyboard, parse_mode = 'MarkdownV2')

    context.user_data[START_OVER] = True
    return SHOWING
async def history(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    buttons = [
        [
            InlineKeyboardButton(text="Back", callback_data=str(END)),
        ],
    ]
    keyboard = InlineKeyboardMarkup(buttons)
    latest_block = w3.eth.get_block_number()
    enter_txns = []
    market_ids = []
    prize_pools = []
    user_entries= []
    winners = []
    iteration = 0
    await update.callback_query.message.reply_text('Fetching history for the past 24 hours')
    while len(market_ids) < 10 and iteration < 40:
        enter_market_filter = win_contract_obj.events.EnteredMarket.create_filter(fromBlock=latest_block - 1024, toBlock=latest_block, argument_filters={'User': user_info[update.callback_query.message.chat_id].address}).get_all_entries()
        latest_block -= 1025
        iteration+=1
        if enter_market_filter != []:
            enter_market_filter.reverse()
            for enter in enter_market_filter:
                if enter['args']['MarketId'] not in market_ids:
                    market_ids.append(enter['args']['MarketId'])
            [enter_txns.append(txn) for txn in enter_market_filter]
    for market in market_ids:
        prize_pools.append(win_contract_obj.functions.getRoundAmount(market).call({'from': user_info[update.callback_query.message.chat_id].address}))
        winners.append(win_contract_obj.functions.getRoundWinner(market).call({'from': user_info[update.callback_query.message.chat_id].address}))
        user_entries.append(0)
    for txn in enter_txns:
        user_entries[market_ids.index(txn['args']['MarketId'])] += txn['args']['Amount']
    text = ("Round Ids: " + str(market_ids) + "\nPrize pools:" + str(prize_pools) + "\nUser entries: " + str(user_entries)
            + "\nRounds winners: " + str(winners))
    await update.callback_query.message.reply_text(
        text,
        reply_markup = keyboard)

    context.user_data[START_OVER] = True
    return SHOWING
async def withdraw(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    buttons = [
        [
            InlineKeyboardButton(text="Proceed", callback_data=str(GET_ADDRESS)),
        ],
        [
            InlineKeyboardButton(text="Back", callback_data=str(END)),
        ],
    ]
    keyboard = InlineKeyboardMarkup(buttons)
    try:
        if  w3.eth.get_balance(user_info[update.callback_query.message.chat_id].address) < 10**13:
            buttons = [
                [
                    InlineKeyboardButton(text="Back", callback_data=str(END)),
                ],
            ]
            keyboard = InlineKeyboardMarkup(buttons)
            await update.callback_query.answer()
            await update.callback_query.edit_message_text(
                'Not enough balance',
                reply_markup=keyboard, parse_mode='MarkdownV2')
        else:
            await update.callback_query.answer()
            await update.callback_query.edit_message_text(
                'Please type the address that you want to witdraw to\.',
                reply_markup = keyboard, parse_mode = 'MarkdownV2')
    except:
        buttons = [
            [
                InlineKeyboardButton(text="Back", callback_data=str(SELECTING_ACTION)),
            ],
        ]
        keyboard = InlineKeyboardMarkup(buttons)
        await update.message.reply_text('Invalid balance\.',
            reply_markup = keyboard, parse_mode = 'MarkdownV2')
        return GET_ADDRESS
    return GET_ADDRESS
async def stop(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """End Conversation by command."""
    await update.message.reply_text("Okay, bye.")
    return END
async def end(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """End conversation from InlineKeyboardButton."""
    await update.callback_query.answer()
    text = "See you around!"
    await update.callback_query.edit_message_text(text=text)
    return END
async def end_second_level(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Return to top level conversation."""
    context.user_data[START_OVER] = True
    await start(update, context)
    return END
async def ask_for_input(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    """Prompt user to input data for selected feature."""
    text = "Okay, tell me."
    try:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text(text=text)
    except:
        await update.message.reply_text("Invalid input try again!")
        await update.message.reply_text("Available balance: " + str(round(w3.eth.get_balance(user_info[update.message.from_user.id].address) / 10**18, 3)))
    return TYPING
async def ask_for_address(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    """Prompt user to input data for selected feature."""
    text = "Okay, tell me."
    try:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text(text=text)
    except:
        await update.message.reply_text("Invalid address try again!")
    return PROCESS_ADDRESS
async def process_address(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    address = ''
    try:
        address = w3.to_checksum_address(update.message.text)
    except:
        return await ask_for_address(update, context)
    context.user_data[WITHDRAW_ADDRESS] = address
    return await ask_for_amount(update, context)
async def ask_for_amount(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    """Prompt user to input data for selected feature."""
    text = "Type the amount to withdraw"
    await update.message.reply_text(text)
    await update.message.reply_text("Available balance: " + str(round(w3.eth.get_balance(user_info[update.message.from_user.id].address) / 10**18, 3)))
    return TYPING
async def withdraw_all(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    try:
        balance = w3.eth.get_balance(user_info[update.message.from_user.id].address)
        amount = int(float(update.message.text) * 10**18)
        if amount >= balance:
            amount = balance - 21000 * w3.eth.gas_price
        elif amount + 21000 * w3.eth.gas_price > balance:
            amount -= 21000 * w3.eth.gas_price
        transaction = {
            'from': user_info[update.message.chat_id].address,
            'value': amount,
            'to': context.user_data[WITHDRAW_ADDRESS],
            'gasPrice': w3.eth.gas_price,
            'gas': 21000,
            'nonce': w3.eth.get_transaction_count(user_info[update.message.chat_id].address),
            'chainId': 80001
        }
        signed = w3.eth.account.sign_transaction(transaction, user_info[update.message.chat_id].key)
        hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        txn_receipt = w3.eth.wait_for_transaction_receipt(hash)
        await update.message.reply_text('Txn hash: https://mumbai.polygonscan.com/tx/'+str(w3.to_hex(txn_receipt['transactionHash'])))
    except Exception as e:
        if 'message' not in str(e):
            if w3.eth.get_balance(user_info[update.message.chat_id].address) < 10 ** 13:
                buttons = [
                    [
                        InlineKeyboardButton(text="Back", callback_data=str(END)),
                    ],
                ]
                keyboard = InlineKeyboardMarkup(buttons)
                await update.callback_query.answer()
                await update.callback_query.edit_message_text(
                    'Not enough balance',
                    reply_markup=keyboard, parse_mode='MarkdownV2')
            else:
                return await ask_for_amount(update, context)
        else:
            await end_second_level(update, context)
            return END
    buttons = [
        [
            InlineKeyboardButton(text="Back", callback_data=str(WITHDRAW)),
        ],
    ]
    keyboard = InlineKeyboardMarkup(buttons)
    await update.message.reply_text(
        'Completed',
        reply_markup=keyboard, parse_mode='MarkdownV2')
    return END
async def place_bet(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    input = 0
    try:
        input = int(float(update.message.text) * 10**18)
    except:
        return await ask_for_input(update, context)
    try:
        user_balance = w3.eth.get_balance(user_info[update.message.from_user.id].address)
        if (user_balance < input):
            return await ask_for_input(update, context)
        transaction ={
            'nonce': w3.eth.get_transaction_count(user_info[update.message.from_user.id].address),
            'gasPrice': w3.eth.gas_price,
            'from': user_info[update.message.from_user.id].address,
            'value': input
        }
        txn = win_contract_obj.functions.enterMarket().build_transaction(transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, user_info[update.message.from_user.id].key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        set_currency_txn_receipt = w3.eth.wait_for_transaction_receipt(sent)
        await update.message.reply_text('Txn hash: https://mumbai.polygonscan.com/tx/'+str(w3.to_hex(set_currency_txn_receipt['transactionHash'])))
    except Exception as e:
        buttons = [
            [InlineKeyboardButton(text="BACK", callback_data=str(END))],
        ]
        keyboard = InlineKeyboardMarkup(buttons)
        await update.message.reply_text(str(e), reply_markup=keyboard)
        return END
    return await enter_round_menu(update, context)
async def end_enter_level(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data[START_OVER] = True
    await select_current_round(update, context)
    return END
async def stop_nested(update: Update, context: ContextTypes.DEFAULT_TYPE) -> str:
    """Completely end conversation from within nested conversation."""
    await update.message.reply_text("Okay, bye.")
    return STOPPING
def main() -> None:
    """Run the bot."""
    # Create the Application and pass it your bot's token.
    application = ApplicationBuilder().token("6221671756:AAGCgUcWoT2ZnIP0O2EtcNmLhj_k4uL-p6M").build()

    # Set up third level ConversationHandler (enter round)
    enter_round = ConversationHandler(
        entry_points=[CallbackQueryHandler(enter_round_menu, pattern="^" + str(ENTER) + "$")],
        states={
            GET_AMOUNT: [CallbackQueryHandler(ask_for_input, pattern="^(?!" + str(END) + ").*$")],
            TYPING: [MessageHandler(filters.TEXT & ~filters.COMMAND, place_bet)]
        },
        fallbacks=[
            CallbackQueryHandler(end_enter_level, pattern="^" + str(END) + "$"),
            CommandHandler("stop", stop_nested),
        ],
        map_to_parent={
            # Return to top level menu
            END: SELECTING_ACTION,
            # End conversation altogether
            STOPPING: END,
        },
    )

    # Set up second level ConversationHandler (current round)
    second_layer_selection_handlers = [
        enter_round,
        CallbackQueryHandler(quick_enter, pattern="^" + str(QUICK_ENTER) + "$"),
        CallbackQueryHandler(select_current_round, pattern="^" + str(REFRESH) + "$"),
    ]
    current_round = ConversationHandler(
        entry_points=[CallbackQueryHandler(select_current_round, pattern="^" + str(CURRENT_ROUND) + "$")],
        states={
            SELECTING_ACTION:  second_layer_selection_handlers,
        },
        fallbacks=[
            CallbackQueryHandler(end_second_level, pattern="^" + str(END) + "$"),
            CommandHandler("stop", stop_nested),
        ],
        map_to_parent={
            # Return to top level menu
            END: SELECTING_ACTION,
            # End conversation altogether
            STOPPING: END,
        },
    )

    claim_layer_selection_handlers = [
        CallbackQueryHandler(claim,  pattern="^" + str(CLAIM) + "$"),
        CallbackQueryHandler(claim_pending_winnings, pattern="^" + str(REFRESH) + "$"),
    ]
    claim_winnings = ConversationHandler(
        entry_points=[CallbackQueryHandler(claim_pending_winnings, pattern="^" + str(CLAIM_WINNINGS) + "$")],
        states={
            SELECTING_ACTION:  claim_layer_selection_handlers,
        },
        fallbacks=[
            CallbackQueryHandler(end_second_level, pattern="^" + str(END) + "$"),
            CommandHandler("stop", stop_nested),
        ],
        map_to_parent={
            # Return to top level menu
            END: SELECTING_ACTION,
            # End conversation altogether
            STOPPING: END,
        },
    )

    withdraw_handler = ConversationHandler(
        entry_points=[CallbackQueryHandler(withdraw, pattern="^" + str(WITHDRAW) + "$")],
        states={
            GET_ADDRESS: [CallbackQueryHandler(ask_for_address, pattern="^(?!" + str(END) + ").*$")],
            PROCESS_ADDRESS: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_address)],
            GET_AMOUNT: [CallbackQueryHandler(ask_for_amount, pattern="^(?!" + str(END) + ").*$")],
            TYPING: [MessageHandler(filters.TEXT & ~filters.COMMAND, withdraw_all)]
        },
        fallbacks=[
            CallbackQueryHandler(end_second_level, pattern="^" + str(END) + "$"),
            CallbackQueryHandler(stop_nested, pattern="^" + str(STOPPING) + "$"),
            CommandHandler("stop", stop_nested),
        ],
        map_to_parent={
            # Return to top level menu
            END: SELECTING_ACTION,
            # End conversation altogether
            STOPPING: END,
        }
    )

    # Set up top level ConversationHandler (selecting action)
    # Because the states of the third level conversation map to the ones of the second level
    # conversation, we need to make sure the top level conversation can also handle them
    selection_handlers = [
        current_round,
        claim_winnings,
        CallbackQueryHandler(deposit, pattern="^" + str(DEPOSIT) + "$"),
        withdraw_handler,
        CallbackQueryHandler(history, pattern="^" + str(HISTORY) + "$"),
        CallbackQueryHandler(end, pattern="^" + str(END) + "$"),
    ]
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            SHOWING: [CallbackQueryHandler(start, pattern="^" + str(END) + "$")],
            SELECTING_ACTION: selection_handlers,
            CURRENT_ROUND: selection_handlers,
            STOPPING: [CommandHandler("start", start)],
        },
        fallbacks=[CommandHandler("stop", stop)],
    )

    application.add_handler(conv_handler)

    # Run the bot until the user presses Ctrl-C
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()