const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
// Local ganache test network
const localProvider = "http://127.0.0.1:8545"
const web3 = new Web3(localProvider)
const { interface, bytecode } = require('../compile')

let accounts;
let inbox;
const INITIAL_MESSAGE = 'Hi there!'

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts()

    // Use on of those accounts to deploy the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [INITIAL_MESSAGE] })
        .send({ from: accounts[0], gas: 1000000 })
})

describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address)
    })

    it('has a default message', async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, INITIAL_MESSAGE)
    });

    it('can change the message', async() => {
        const newMessage = 'bye'
        const hash = await inbox.methods.setMessage(newMessage).send({ from: accounts[0] })
        const message = await inbox.methods.message().call();
        assert.equal(message, newMessage)
    })
})
