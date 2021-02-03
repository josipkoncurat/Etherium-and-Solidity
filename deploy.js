const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const { interface, bytecode } = require('./compile')

// constructor takes 2 parameters: Mnemonic of my wallet and the api to Rinkeby public test network
const provider = new HDWalletProvider(
    'spider over reflect survey smart canoe general option regret carry donkey quiz',
    'https://rinkeby.infura.io/v3/150c03b392b244668595313c221d3c98'
)
const web3 = new Web3(provider)

const INITIAL_MESSAGE = 'Hi there!'

// Use the instance of web3 to deploy a new contract
const deploy = async () => {
    // Get a list of all accounts
    const accounts = await web3.eth.getAccounts()
    console.log('Attempting to deploy from account', accounts[0])

    // Use on of those accounts to deploy the contract
   const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [INITIAL_MESSAGE] })
        .send({ from: accounts[0], gas: 1000000 })

    console.log('Contract deployed to address:', result.options.address)
}
deploy()

// Monitor transactions at https://rinkeby.etherscan.io/