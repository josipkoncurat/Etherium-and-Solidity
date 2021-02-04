const assert = require('assert')
const localProvider = "http://127.0.0.1:8545"
const Web3 = require('web3')
const web3 = new Web3(localProvider)

const { interface, bytecode } = require('../compile')

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()

    // Use on of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: 1000000 })

})

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address)
    });
    it('allows one account to enter', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.1', 'ether')
        });
        let players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length)
    });
    it('allows multiple accounts to enter', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.1', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.1', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.1', 'ether')
        });
        let players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length)
    });
    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.001', 'ether')
            });
            assert(false)
        } catch(e) {
            assert(e)
        }
    })
    it('only manager can call pick winner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1],
            });
            assert(false)
        } catch(e) {
            assert(e)
        }
    })
    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });
        const initalBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({
            from: accounts[0],
        });
        const finalBalance = await web3.eth.getBalance(accounts[0])
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.equal(0, players.length)
        const difference = finalBalance - initalBalance
        assert(difference > web3.utils.toWei('1.8', 'ether'))
    })
})