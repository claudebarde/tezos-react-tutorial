import React, { useState } from "react";

const upperFirst = str => str[0].toUpperCase() + str.slice(1);

const mutezToTez = mutez =>
  Math.round((parseInt(mutez) / 1000000 + Number.EPSILON) * 100) / 100;

const Menu = ({
  coffeeMenu,
  contractInstance,
  userAddress,
  setBalance,
  Tezos,
  userPoints,
  setUserPoints
}) => {
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(undefined);

  const buyCoffee = async (coffee, price) => {
    try {
      const op = await contractInstance.methods
        .buy(coffee)
        .send({ amount: price, mutez: true });
      console.log(op);
      if (op.status === "applied") {
        setTxStatus("applied");
        setTxHash(op.hash);
      } else {
        setTxStatus("error");
        throw Error("Transation not applied");
      }

      await op.confirmation(1);
      if (op.includedInBlock !== Infinity) {
        setTxStatus("included");
        const newBalance = await Tezos.tz.getBalance(userAddress);
        setBalance(newBalance);
        setUserPoints(userPoints + 1);
      } else {
        throw Error("Transation not included in block");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (txStatus === null) {
    let redeemPointsButton = "";
    if (userPoints === undefined) {
      redeemPointsButton = <span>No point available</span>;
    } else if (userPoints >= 0 && userPoints <= 9) {
      redeemPointsButton = <span>Number of points: {userPoints}</span>;
    } else if (userPoints === 10) {
      redeemPointsButton = <span className="action">Redeem Points</span>;
    }

    return (
      <>
        <div className="app-subtitle">Please choose your coffee:</div>
        {coffeeMenu.map(coffee => (
          <div className="card coffee_selection" key={coffee.name}>
            <div className="card-content">
              {upperFirst(coffee.name)} (ꜩ {mutezToTez(coffee.price)})
            </div>
            {userAddress && (
              <div className="card-footer">
                <p className="card-footer-item">
                  <span
                    className="action"
                    onClick={() => buyCoffee(coffee.name, coffee.price)}
                  >
                    Buy
                  </span>
                </p>
                <p className="card-footer-item">{redeemPointsButton}</p>
              </div>
            )}
          </div>
        ))}
      </>
    );
  } else if (txStatus === "applied") {
    return (
      <div className="message is-info">
        <div className="message-header">
          <p>Waiting for confirmation</p>
        </div>
        <div className="message-body">
          <p>Your transaction is being processed, please wait.</p>
          <p>Transaction number: {txHash}</p>
        </div>
      </div>
    );
  } else if (txStatus === "included") {
    return (
      <div className="message is-success">
        <div className="message-header">
          <p>Transaction confirmed!</p>
        </div>
        <div className="message-body">
          <p>Enjoy your coffee!</p>
          <br />
          <p>
            <button
              className="button is-info"
              onClick={() => setTxStatus(null)}
            >
              Buy a new coffee
            </button>
          </p>
        </div>
      </div>
    );
  } else if (txStatus === "error") {
    return (
      <div className="message is-danger">
        <div className="message-header">
          <p>Error</p>
        </div>
        <div className="message-body">
          <p>An error has occurred, please try again.</p>
        </div>
      </div>
    );
  }
};

export default Menu;
