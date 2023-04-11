db = db.getSiblingDB("eden");

db.createUser({
  user: "eden",
  pwd: "eden",
  roles: [
    {
      role: "readWrite",
      db: "eden",
    },
  ],
});

db.createCollection("livemints");
