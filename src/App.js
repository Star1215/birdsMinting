import React from 'react'
import { useEffect, useState, useRef } from 'react'
import Web3 from "web3"
import { FullPage, Slide } from 'react-full-page'
import ReactPlayer from 'react-player'
import { ToastContainer, toast } from "react-toastify";
import swal from "sweetalert";
import { contractAbi, contractAddress } from './config'
import tokenSlider from './components/tokenSlider'
import styled from 'styled-components'

import { Image, Button, Container, Row, Col, Card, Text } from 'react-bootstrap'
import thirdImage from './assets/third-section.jpeg'
import sectionVideo from './assets/Output.gif'
import line1 from './assets/line1.png'
import line2 from './assets/line2.png'
import line3 from './assets/line3.png'
import line4 from './assets/line4.png'
import line5 from './assets/line5.png'
import line6 from './assets/line6.png'
import line7 from './assets/line7.png'
import line8 from './assets/line8.png'

import Header from './components/Header'
import Footer from './components/Footer'
import Roadmap from './components/roadmap'

// Custom Style
import './App.css'

const StyledPadding = styled.div`
  padding-top: 8px;
  padding-bottom: 8px;
`
const StyledCard = styled(Card)`
  background: linear-gradient(111.68deg, rgb(242, 236, 242) 0%, rgb(232, 242, 246) 100%);
  box-shadow: rgb(0 152 161) 0px 0px 0px 1px, rgb(31 199 212 / 40%) 0px 0px 4px 8px;
  border-radius: 24px;
  padding: 24px;
  align-items: center;
  font-size: 24px;
  height: fit-content;
  padding-top: 64px;
  margin: auto;
  
`
const StyledWrapper = styled.div`
  text-align: left;
`

const App = () => {

  const [chainId, setChainId] = useState(null);
  const [method, setMethod] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [owner, setOwner] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [price, setPrice] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  let [mintNum, setMintNum] = useState(1);
  const api = "https://supbirds.com/meta/";

  useEffect(async () => {
    loadWeb3();
  }, []);

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        loadBlockchainData();
        getCurrentAddressConnected();
        addAccountsAndChainListener();
      } catch (error) {
        console.error(error);
      }
    } else {
      swal(
        "",
        "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!",
        "error"
      );
    }
  }
  const loadBlockchainData = async () => {
    const contract = new window.web3.eth.Contract(contractAbi, contractAddress);
    setContract(contract);
    const chainId = await window.web3.eth.getChainId();
    setChainId(chainId);
    {
      chainId === 4 ? setMethod("success") : setMethod("error");
    }
    // method && fireToast()

    // if (chainId === 1) {
    const owner = await contract.methods.owner().call();
    setOwner(owner);

    const totalSupply = await contract.methods.totalSupply().call();
    setTotalSupply(totalSupply);
    
    const price = await contract.methods.cost().call();
    setPrice(price);
    const displayPrice = window.web3.utils.fromWei(price, "ether");
    setDisplayPrice(displayPrice);

    const maxSupply = await contract.methods.maxSupply().call();
    setMaxSupply(maxSupply);

    //event will be fired by the smart contract when a new PetPal is minted
    contract.events
      .Mint()
      .on("data", async function (result) {
        setTotalSupply(result.returnValues[1]);
      })
      .on("error", console.error);
    // }
  };

  const getCurrentAddressConnected = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addAccountsAndChainListener = async () => {
    //this event will be emitted when the currently connected chain changes.
    window.ethereum.on("chainChanged", (_chainId) => {
      window.location.reload();
    });

    // this event will be emitted whenever the user's exposed account address changes.
    window.ethereum.on("accountsChanged", (accounts) => {
      window.location.reload();
    });
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        document.getElementById("connectButton").disabled = true;
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        document.getElementById("connectButton").disabled = false;
        setAccount(accounts[0]);
        method && fireToast();
      } catch (error) {
        if (error.code === 4001) {
          swal("Request to access account denied!", "", "error");
        }
        document.getElementById("connectButton").disabled = false;
      }
    }
  };
  
  async function mint(mintCount) {
    if (contract) {
      // console.log('debug->contract', contract)
      // if (chainId === 1) {
      if (mintCount === 0) {
        swal("Minimum mint amount is 1 PetPal", "", "info");
      } else {
        try {
          const finalPrice = Number(price) * mintCount;
          console.log('debug->here', account, finalPrice)
          await contract.methods
            .mint(account, mintCount)
            .send({ from: account, value: finalPrice });
        } catch (error) {
          if (error.code === 4001) {
            swal("Transaction Rejected!", "", "error");
          } else {
            swal("Transaction Failed!", "", "error");
          }
        }
      }
      // } else {
      //   swal("Please switch to mainnet to mint PetPal", "", "error");
      // }
    } else {
      swal(
        "",
        "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!",
        "error"
      );
    }
  }

  // async function pauseMint() {
  //   if (contract) {
  //     if( account == owner) {
  //       try {
  //         await contract.methods
  //           .pause(true)
  //           .send({ from: account });
  //       } catch (error) {
  //         if (error.code === 4001) {
  //           swal("Transaction Rejected!", "", "error");
  //         } else {
  //           swal("Transaction Failed!", "", "error");
  //         }
  //       }
  //     } else {
  //       swal(
  //         "",
  //         "Contract owner can control pause or resume minting",
  //         "error"
  //       );
  //     }
  //   } else {
  //     swal(
  //       "",
  //       "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!",
  //       "error"
  //     );
  //   }
  // }

  // async function resumeMint() {
  //   if (contract) {
  //     if(account == owner) {
  //       try {
  //         await contract.methods
  //           .pause(false)
  //           .send({ from: account });
  //       } catch (error) {
  //         if (error.code === 4001) {
  //           swal("Transaction Rejected!", "", "error");
  //         } else {
  //           swal("Transaction Failed!", "", "error");
  //         }
  //       }
  //     } else {
  //       swal(
  //         "",
  //         "Contract owner can control pause or resume minting",
  //         "error"
  //       );
  //     }
  //   } else {
  //     swal(
  //       "",
  //       "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!",
  //       "error"
  //     );
  //   }
  // }

  function handleMinus() {
    // let newNum = 1
    // if(mintNum >= 2)
    //   newNum = mintNum-1;
    // setMintNum(newNum);
    if(mintNum >= 2)
      setMintNum(mintNum - 1)
  }

  function handlePlus() {
    // const nuwNum = mintNum + 1;
    // setMintNum(nuwNum);
    setMintNum(mintNum + 1)
  }
  const fireToast = () => {
    toast[method](
      `You are ${method === "error" ? "not" : ""} connected to mainnet`,
      {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
      }
    );
  };

  return (
    <FullPage controls={false}>
      <Header />

      {/* Section 1 */}
      <Slide className='top__section' id='home'>
        <div className='container'>
          {/* <div className='row text-center'> */}
            {/* <div className='col-md-9 m-auto'> */}
              {/* <h1>
                Mint Sup Bird NFT
              </h1> */}
              {/* <div>
                <Button variant='primary' onClick={() =>pauseMint()}>Pause Minting</Button>
                <Button variant='primary' onClick={() =>resumeMint()}>Resume Minting</Button>
              </div> */}
              <StyledCard className='mintCard'>
                <h1>{totalSupply}/{maxSupply}</h1>
                <p className='sub__heading'>
                  {contractAddress.slice(0, 7) + '...' + contractAddress.slice(contractAddress.length - 4)}
                </p>
                <p className='sub__heading'>
                  1 SupBird costs {price / 10**18 } ETH
                </p>
                <p className='sub__heading'>
                  Click buy to mint your NFT
                </p>
                <div class="qty mt-1">
                  <span class="minus bg-dark" onClick={() => handleMinus()}>-</span>
                  <input type="number" class="count" name="qty" value={mintNum} />
                  <span class="plus bg-dark" onClick={()=>handlePlus()}>+</span>
                </div>
                <StyledPadding />
                {/* {account? <Button variant='primary' onClick={() =>mint(mintNum)}>Mint a RIZK</Button> : 
                <Button variant='primary' id='connectButton' onClick={connectMetaMask}>Connect Wallet</Button>} */}
                <Button variant='primary' onClick={() =>mint(mintNum)}>Mint a SupBird</Button>
              </StyledCard>
            {/* </div> */}
          {/* </div> */}
        </div>
      </Slide>

      {/* Section 2 */}
      <Slide className='second__section' id='rizk'>
        <div className='container'>
          <div className='row'>
            <div className='col-md-6 content'>
              <h2>About the SupBird</h2>
              <p className='content'>
              SupBirds are 5000 unique bird characters which live on Ethereum Blockchain. 
              Each Sup Bird comes with proof of ownership, represented by the ERC721 standard. 
              The main mission of SupBirds NFT project is to create the best NFT community by connecting designers, blockchain developers and investors under one roof and. 
              Each NFT Owner will have exclusive roles in the community as well as rights to vote for future development. 
              </p>
              <Button variant='primary' onClick={() =>mint(mintNum)}>Mint a SupBird</Button>
            </div>
            <div className='col-md-6 video'>
              <tokenSlider />
              {/* <ReactPlayer
                url={sectionVideo}
                controls={false}
                playing={true}
                muted={true}
                loop={true}
                width='auto'
                style={{ textAlign: 'center' }}
              /> */}
            </div>
          </div>
        </div>
      </Slide>

      {/* Section 3 */}
      <Slide className='third__section' id='distribution'>
        <Container>
          <Row>
            <Col md={5}>
              <Image src={thirdImage} fluid />
            </Col>
            <Col md={7}>
              <h2>Rarity</h2>
              <StyledWrapper>
              <ul>
                <li>🐔 Heads 10</li>
                <li>👀 Eyes 10</li>
                <li>🖥Background 10</li>
                <li>👕Clothes 10 </li>
                <li>🍗Fur 10</li>
              </ul>
              </StyledWrapper>
              {/* <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse porta cursus turpis, vel accumsan massa accumsan ut.
                Donec rhoncus tempus rutrum.
              </p> */}
              <Button variant='primary'>Mint a SupBird</Button>
            </Col>
          </Row>
        </Container>
      </Slide>

      {/* Section 4 */}
      {/* <Slide className='forth__section' id='team'>
        <Container>
          <Row className='text-center'>
            <Col md={12} className='mb-5'>
              <h1>Line Up</h1>
            </Col>
            <Col md={3}>
              <Image src={line1} fluid className='mb-5' />
              <h3>Halo</h3>
            </Col>
            <Col md={3}>
              <Image src={line2} fluid className='mb-5' />
              <h3>MadMax</h3>
            </Col>
            <Col md={3}>
              <Image src={line3} fluid className='mb-5' />
              <h3>Basi</h3>
            </Col>
            <Col md={3}>
              <Image src={line4} fluid className='mb-5' />
              <h3>Nodo</h3>
            </Col>
            <Col md={3}>
              <Image src={line5} fluid className='mb-5' />
              <h3>Mimi</h3>
            </Col>
            <Col md={3}>
              <Image src={line6} fluid className='mb-5' />
              <h3>Sava</h3>
            </Col>
            <Col md={3}>
              <Image src={line7} fluid className='mb-5' />
              <h3>Peto</h3>
            </Col>
            <Col md={3}>
              <Image src={line8} fluid className='mb-5' />
              <h3>Qiya</h3>
            </Col>
          </Row>
        </Container>
      </Slide> */}

      {/* Section 5 */}
      <Slide className='fifth__section' id='roadmap'>
        <Container>
          <Row>
            <Col md={12}>
              <h2>The Roadmap</h2>
              {/* <Roadmap /> */}
              <div className='mt-5'>
                {/* <p className='text'>PRESALE</p> */}
                {/* <p className='text'>
                  The buyers of the first 500 RIZK will participate in
                  an AirDrop of 10 RIZK (so cap)
                </p> */}
                <StyledWrapper>
                <ul>
                  <li>10% - Auto generating and Revealing all SupBirds </li>
                  <li>20% - Releasing 1 ETH as design competition </li>
                  <li>30% - Listing all Birds on Rarity.tools and Discord Server Boosting </li>
                  <li>40% - Launching SupBird Branded online store.  </li>
                  <li>50% - Massive Marketing and PR campaigns </li>
                  <li>60% - Giveaway the first ever minted SupBird  </li>
                  <li>70% - Dropping Second Unique Collection where each SupBird owner will be able to claim Free NFT  </li>
                  <li>80% - Releasing the Sup Grand as a Future Development ETH Fund. This will bring extra utility to SupBirds ecosystem   </li>
                  <li>100% - Purchasing Real Estate Property on a tiny island. Everyone will be invited! </li>
                  <li>? - Big Surprise </li>
                </ul>
                </StyledWrapper>
                <p className='text'>
                *More information on our roadmap please join our Discord Channel
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </Slide>

      <Slide className='six__section' id='royalty'>
        <Container>
          <Row>
            <Col md={12}>
              <h2>The Royalties</h2>
                <div className='mt-5'>
                  <StyledWrapper>
                    <p>
                    In order to provide a long term strategy and project growth, SupBirds will have royalty fees from all secondary market sales. 
                    The fees will be split and allocated as follow:
                    </p>
                    <ul>
                      <li>30% Buybacks, giveaways and future development.  </li>
                      <li>20% Supporting other projects and airdropping to Sup Bird Holders as monthly giveaways.  </li>
                      <li>20% For Partnerships and support of other projects </li>
                    </ul>
                  </StyledWrapper>
                </div>
            </Col>
          </Row>
        </Container>
      </Slide>

      <Footer />
    </FullPage>
  )
}

export default App
