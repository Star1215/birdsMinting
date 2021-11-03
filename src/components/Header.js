import React, { useState, useEffect } from 'react'
import { Navbar, Nav, Button, Container } from 'react-bootstrap'
import styled from 'styled-components'
import { ToastContainer, toast} from 'react-toastify'
import swal from "sweetalert";
import { contractAbi, contractAddress } from '../config';
import axios from "axios"


const StyledPadding = styled.div`
  padding-left: 8px;
  padding-right: 16px;
`


const Header = () => {
  const [chainId, setChainId] = useState(null);
  const [account, setAccount] = useState(null);
  const [method, setMethod] = useState(null);
  const [contract, setContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [price, setPrice] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  const api = "https://metadata.petpals.io";

  useEffect(() => {
    account && method && fireToast();
  }, [method]);
  
  useEffect(() => {
    const initialize = async () => {
      const balance = await contract.methods.balanceOf(account).call();
      setBalance(balance);

      const tokens = [];
      for (let index = 0; index < balance; index++) {
        const tokenId = await contract.methods.tokenOfOwnerByIndex(account, index).call();
        const res = await axios.get(`${api}/${tokenId}.json`);
        tokens.push({
          tokenId,
          data: res.data
        });
      }
      setTokens(tokens);
    }

    if (contract && account) initialize();

  }, [account, contract])

  const loadBlockchainData = async () => {
    const contract = new window.web3.eth.Contract(contractAbi, contractAddress);
    setContract(contract);
    const chainId = await window.web3.eth.getChainId();
    setChainId(chainId);
    {
      chainId === 1 ? setMethod("success") : setMethod("error");
    }
    // method && fireToast()

    // if (chainId === 1) {
    const totalSupply = await contract.methods.totalSupply().call();
    setTotalSupply(totalSupply);

    const price = await contract.methods.price().call();
    setPrice(price);
    const displayPrice = window.web3.utils.fromWei(price, "ether");
    setDisplayPrice(displayPrice);

    //event will be fired by the smart contract when a new PetPal is minted
    contract.events
      .Mint()
      .on("data", async function (result) {
        setTotalSupply(result.returnValues[1]);
      })
      .on("error", console.error);
    // }
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
        console.log('debug->account', accounts[0])
      } catch (error) {
        if (error.code === 4001) {
          swal("Request to access account denied!", "", "error");
        }
        document.getElementById("connectButton").disabled = false;
      }
    }
  };
  
  const fireToast = () => {
    toast[method](
      `You are ${method === "error" ? "not" : ""} connected to mainnet`,
      {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: true,
      }
    );
  };

  async function mint(mintCount) {
    if (contract) {
      // if (chainId === 1) {
      if (mintCount === 0) {
        swal("Minimum mint amount is 1 PetPal", "", "info");
      } else {
        try {
          const finalPrice = Number(price) * mintCount;
          await contract.methods
            .createPPetPal()
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

  return (
    <header>
      <Navbar fixed='top' expand='lg'>
        <Container>
          <Navbar.Brand href='#home'> SupBirds</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='m-auto'>
              <Nav.Link href='#home'> Home </Nav.Link>
              <Nav.Link href='#rizk'> The SupBirds </Nav.Link>
              <Nav.Link href='#distribution'>Rarity</Nav.Link>
              {/* <Nav.Link href='#team'>LineUp</Nav.Link> */}
              <Nav.Link href='#roadmap'>Roadmap</Nav.Link>
              <Nav.Link href='#royalty'>Royalties</Nav.Link>
            </Nav>
            <Button variant='primary' id='connectButton' onClick={connectMetaMask}>{!account? 'Connect Wallet' : account.slice(0, 7) + '...' + account.slice(account.length - 4)}</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
