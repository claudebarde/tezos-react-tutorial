import React, { useState } from "react";

const upperFirst = str => str[0].toUpperCase() + str.slice(1);

const Menu = ({ coffeeMenu, contractInstance, userAddress }) => {
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(undefined);

  const buyCoffee = async (coffee, price) => {
    try {
      const op = await contractInstance.methods
        .buy(coffee)
        .send({ amount: price });
      console.log(op);
      if (op.status === "applied") {
        setTxStatus("applied");
        setTxHash(op.hash);
      } else {
        throw Error("Transation not applied");
      }

      await op.confirmation(1);
      if (op.includedInBlock !== Infinity) {
        setTxStatus("included");
      } else {
        throw Error("Transation not included in block");
      }
      /*console.log(op.includedInBlock);
      const hash = await op.confirmation(1);
      console.log(hash);
      console.log();*/
    } catch (error) {
      console.log(error);
    }
  };

  if (txStatus === null) {
    return (
      <>
        <div className="app-subtitle">Please choose your coffee:</div>
        {coffeeMenu.map(coffee => (
          <div className="card coffee_selection" key={coffee.name}>
            <div className="card-content">
              {upperFirst(coffee.name)} (ꜩ {coffee.price})
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
                <p className="card-footer-item">
                  <span className="action">Redeem Points</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </>
    );
  } else if (txStatus === "applied") {
    return <div>Waiting...</div>;
  } else if (txStatus === "included") {
    return <div>Included!</div>;
  }
};

export default Menu;
