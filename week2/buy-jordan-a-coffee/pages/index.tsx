import abi from '../utils/BuyMeACoffee.json'
import { Contract, ethers } from 'ethers'
import Head from 'next/head'
import Image from 'next/image'
import React, { ChangeEvent, useEffect, useState } from 'react'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = '0xE12ca82ecF19a1dc2206D6325BD2Bf16857C6f33'
  const contractABI = abi

  // Component state
  const [currentAccount, setCurrentAccount] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [memos, setMemos] = useState<Memo[]>([])

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const onMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value)
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log('accounts: ', accounts)

      if (accounts.length > 0) {
        const account = accounts[0]
        console.log('wallet is connected! ' + account)
      } else {
        console.log('make sure MetaMask is connected')
      }
    } catch (error) {
      console.log('error: ', error)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('please install MetaMask')
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const buyCoffee = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        console.log('buying coffee..')
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : 'anon',
          message ? message : 'Enjoy your coffee!',
          { value: ethers.utils.parseEther('0.001') }
        )

        await coffeeTxn.wait()

        console.log('mined ', coffeeTxn.hash)

        console.log('coffee purchased!')

        // Clear the form fields.
        setName('')
        setMessage('')
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        console.log('fetching memos from the blockchain..')
        const memos = await buyMeACoffee.getMemos()
        console.log('fetched!')
        setMemos(memos)
      } else {
        console.log('Metamask is not connected')
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    let buyMeACoffee: Contract
    isWalletConnected()
    getMemos()

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (
      from: string,
      timestamp: number,
      name: string,
      message: string
    ) => {
      console.log('Memo received: ', from, timestamp, name, message)
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date((timestamp as number) * 1000),
          message,
          name,
        } as Memo,
      ])
    }

    const { ethereum } = window

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, 'any')
      const signer = provider.getSigner()
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer)

      buyMeACoffee.on('NewMemo', onNewMemo)
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off('NewMemo', onNewMemo)
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col px-2 items-center justify-center">
      <Head>
        <title>Buy Jordan a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-20 flex-1 flex flex-col justify-center align-center">
        <h1 className="text-6xl font-bold">Buy Jordan a Coffee!</h1>

        {currentAccount ? (
          <div className="flex items-center justify-center pt-8">
            <form>
              <div>
                <label>Name</label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  className="border border-black"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div>
                <label>Send Jordan a message</label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  className="border border-black"
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="button"
                  onClick={buyCoffee}
                  className="font-bold border-4 border-black p-2 rounded-lg"
                >
                  Send 1 Coffee for 0.001ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}> Connect your wallet </button>
        )}
      </main>

      {currentAccount && <h1>Memos received</h1>}

      {currentAccount &&
        memos.map((memo, idx) => {
          return (
            <div
              key={idx}
              style={{
                border: '2px solid',
                borderRadius: '5px',
                padding: '5px',
                margin: '5px',
              }}
            >
              <p style={{ fontWeight: 'bold' }}>"{memo.message}"</p>
              <p>
                From: {memo.name} at {memo.timestamp.toString()}
              </p>
            </div>
          )
        })}

      <footer className="flex justify-center items-center grow">
        <a
          href="https://alchemy.com/?a=roadtoweb3weektwo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by @codedbyjordan following Alchemy's Road to Web3 lesson two!
        </a>
      </footer>
    </div>
  )
}
