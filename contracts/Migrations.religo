type migrations = {
  owner: address,
  last_completed_migration : int,
}

type return = (list(operation), migrations);

let main = ((completed_migration, migrations): (int, migrations)): return => {
  if(sender != migrations.owner){
    failwith("Wrong address"): return;
  } else {
    ([]: list(operation), {...migrations, last_completed_migration: completed_migration});
  }
}