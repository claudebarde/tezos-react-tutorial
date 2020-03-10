type action =
| RedeemPoints
| Buy (string)
| Withdraw

type storage = {
  menu: map (string, tez),
  customers: map(address, nat),
  total: tez,
  owner: address
}

type return = (list (operation), storage);

let addPoint = (storage: storage) : map(address, nat) => {
  /* checks if customer already exists or has points */
  let customer_points: option(nat) = Map.find_opt (Tezos.sender, storage.customers);
  switch (customer_points) {
    | Some (points) => Map.update(Tezos.sender, Some (points + 1n), storage.customers)
    | None => Map.add(Tezos.sender, 1n, storage.customers)
  };
};

/* Customers can redeem their points to have a free coffee! */
let redeemPoints = (storage: storage): return => {
  /* We test if customer has enough points */
  switch (Map.find_opt (Tezos.sender, storage.customers)) {
    | Some (points) => 
      /* if points were found, we check if customer has enough of them */
      if(points >= 10n){
        let updated_customers = 
          Map.update(Tezos.sender, Some (abs(points - 10n)), storage.customers);
        ([]: list(operation), {...storage, customers: updated_customers});
      } else {
        failwith("You don't have enough points!"): return;
      };
    /* if no point found, error */
    | None => failwith("You don't have points!"): return;
  };
}

/* Customers buy coffee */
let buy = ((item, storage): (string, storage)): return => {
  switch(Map.find_opt (item, storage.menu)){
    | Some (price) => 
      if(Tezos.amount < price) {
        failwith("You didn't send enough tez!"): return;
      } else {
        ([]: list(operation), 
        {...storage, 
          total : storage.total + Tezos.amount, 
          customers: addPoint (storage)
        }
        );
      }
    | None => failwith ("No such item found!"): return;
  }
}

/* Owner withdraws total balance of the contract */
let withdraw = (storage: storage): return => {
  /* checks if user is allowed to withdraw balance */
  if (Tezos.sender != storage.owner){
    failwith ("Your are not allowed to perform this action!") : return;
  } else {
    let receiver : option (contract (unit)) = Tezos.get_contract_opt(storage.owner);
    switch(receiver){
      | Some (receiver_address) => {
        let op : operation = Tezos.transaction (unit, balance, receiver_address);
        ([op], storage);
      }
      | None => failwith("Wrong address provided!"): return;
    }
  }
}

let main = ((parameter, storage): (action, storage)) : return =>
 switch(parameter) {
  | RedeemPoints => redeemPoints (storage)
  | Buy (item) => buy ((item, storage))
  | Withdraw => withdraw (storage)
 }
