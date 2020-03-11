const pointOfSale = artifacts.require("PointOfSale");
const { alice } = require("../scripts/sandbox/accounts");

const initial_storage = {
  menu: {
    cappuccino: 2500000,
    latte: 2000000,
    americano: 1600000,
    macchiato: 3000000
  },
  customers: { [alice.pkh]: 0 },
  total: 0,
  owner: alice.pkh
};

module.exports = async deployer => {
  await deployer.deploy(pointOfSale, initial_storage);
};
module.exports.initial_storage = initial_storage;
