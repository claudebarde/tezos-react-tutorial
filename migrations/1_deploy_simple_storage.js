const pointOfSale = artifacts.require("PointOfSale");
const { alice } = require("../scripts/sandbox/accounts");

const initial_storage = {
  menu: {
    cappuccino: 2,
    latte: 3,
    americano: 4,
    macchiato: 1.5
  },
  customers: { [alice.pkh]: 0 },
  total: 0,
  owner: alice.pkh
};

module.exports = async deployer => {
  await deployer.deploy(pointOfSale, initial_storage);
};
module.exports.initial_storage = initial_storage;
