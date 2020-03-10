import React, { useState, useEffect } from "react";
import { Tezos } from "@taquito/taquito";
import { TezBridgeSigner } from "@taquito/tezbridge-signer";
import Menu from "./Menu";
import "./App.css";
import "./bulma.css";

const contractAddress = "KT1LL7SQWU8SE3S82pUggqzE4hiuHrLjBuCq";

const mutezToTez = mutez =>
  Math.round((parseInt(mutez) / 1000000 + Number.EPSILON) * 100) / 100;

const shortenAddress = addr =>
  addr.slice(0, 6) + "..." + addr.slice(addr.length - 6);

const App = () => {
  const [contractInstance, setContractInstance] = useState(undefined);
  const [coffeeMenu, setCoffeeMenu] = useState([]);
  const [userAddress, setUserAddress] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const tezbridge = window.tezbridge;

  const initWallet = async () => {
    try {
      // sets rpc host
      const rpc = await tezbridge.request({
        method: "set_host",
        host: "http://localhost:8732"
      });
      // gets user's address
      const _address = await tezbridge.request({ method: "get_source" });
      setUserAddress(_address);
      // gets user's balance
      const _balance = await Tezos.tz.getBalance(_address);
      setBalance(_balance);
    } catch (error) {
      console.log("error fetching the address or balance:", error);
    }
  };

  useEffect(() => {
    (async () => {
      // sets RPC
      Tezos.setProvider({
        rpc: "http://localhost:8732",
        signer: new TezBridgeSigner()
      });
      // fetches contract storage
      const contract = await Tezos.contract.at(contractAddress);
      setContractInstance(contract);
      const storage = await contract.storage();
      // creates coffee menu
      let coffees = [];
      for (let key of storage.menu.keys()) {
        coffees.push({ name: key, price: storage.menu.get(key).c[0] });
      }
      // updates state
      setCoffeeMenu(coffees);
    })();
  }, []);

  return (
    <div className="App">
      <div className="wallet">
        {balance === undefined ? (
          <button className="button is-info is-light" onClick={initWallet}>
            Connect your wallet
          </button>
        ) : (
          <>
            <span className="balance">ꜩ {balance.toNumber() / 1000000}</span>
            <button className="button is-success is-light">
              {shortenAddress(userAddress)}
            </button>
          </>
        )}
      </div>
      <div className="app-title">Tezos Café</div>
      <div className="logo">
        <img src="coffee-maker.png" alt="logo" />
      </div>
      {coffeeMenu.length === 0 ? (
        "Loading the menu..."
      ) : (
        <Menu
          coffeeMenu={coffeeMenu}
          contractInstance={contractInstance}
          userAddress={userAddress}
        />
      )}
      {/*<div>Icons made by <a href="https://www.flaticon.com/authors/iconixar" title="iconixar">iconixar</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>*/}
    </div>
  );
};

export default App;
