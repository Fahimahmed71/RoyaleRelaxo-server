const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.agyxuyc.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    // hotel_list_collection
    const hotel_list_collection = client
      .db("RoyaleRelaxo")
      .collection("hotel_services");

    // booking_collection
    const booking_collection = client.db("RoyaleRelaxo").collection("booking");

    // user_collection
    const user_collection = client.db("RoyaleRelaxo").collection("users");

    // get services
    app.get("/services", async (req, res) => {
      const query = {};
      const services = await hotel_list_collection.find(query).toArray();

      res.send(services);
    });

    // post services
    app.post("/services", async (req, res) => {
      const services = req.body;
      const result = await hotel_list_collection.insertOne(services);

      res.send(result);
    });

    // delete services
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await hotel_list_collection.deleteOne(query);

      res.send(result);
    });

    // get booking
    app.get("/booking", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const bookings = await booking_collection.find(query).toArray();

      res.send(bookings);
    });

    // get booking id
    app.get("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await booking_collection.findOne(query);

      res.send(result);
    });

    // post booking
    app.post("/booking", async (req, res) => {
      const booking = req.body;

      const query = {
        hotelName: booking.hotelName,
        date: booking.date,
        userName: booking.userName,
      };

      const exists = await booking_collection.findOne(query);

      if (exists) {
        return res.send({ success: false, booking: exists });
      }
      const result = await booking_collection.insertOne(booking);

      res.send({ success: true, result });
    });

    // update Booking
    app.put("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          slot: updateUser.slot,
          date: updateUser.date,
          time: updateUser.time,
        },
      };
      const result = await booking_collection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });

    // delete booking
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await booking_collection.deleteOne(query);

      res.send(result);
    });

    // get available
    app.get("/available", async (req, res) => {
      const date = req.query.date;

      const services = await hotel_list_collection.find().toArray();

      const query = { date: date };
      const bookings = await booking_collection.find(query).toArray();

      services.forEach((service) => {
        const serviceBookings = bookings.filter(
          (booking) => booking.hotelName === service.hotelName
        );

        const bookedSlots = serviceBookings.map((data) => data.slot);
        const availableSlots = service.slots.filter(
          (data) => !bookedSlots.includes(data)
        );
        service.slots = availableSlots;

        service.availableslots = availableSlots;

        const bookedTime = serviceBookings.map((data) => data.time);
        const availableTime = service.time.filter(
          (data) => !bookedTime.includes(data)
        );
        service.time = availableTime;

        service.availabletime = availableTime;
      });

      res.send(services);
    });

    // get available id
    app.get("/available/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await hotel_list_collection.findOne(query);

      res.send(result);
    });

    // get user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = await user_collection.findOne({ email: email });
      const isAdmin = user?.role === "admin";

      res.send(isAdmin);
    });

    // put user
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };

      const updateDoc = {
        $set: user,
      };

      const result = await user_collection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });

    // put user admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;

      const filter = { email: email };

      const updateDoc = {
        $set: { role: "admin" },
      };

      const result = await user_collection.updateOne(filter, updateDoc);

      res.send(result);
    });

    // delete user
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await user_collection.deleteOne(query);

      res.send(result);
    });

    // get user
    app.get("/user", async (req, res) => {
      const users = await user_collection.find().toArray();

      res.send(users);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Royalerelaxo listening on port ${port}`);
});
