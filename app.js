const express = require("express");
const PORT = 3000 || process.env.PORT;
const jwt = require("jsonwebtoken");
const mysql = require('mysql');
const tokencheck = require("./tokencheck");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

/**
 * Image upload configuration
 * start
 */

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
let upload = multer({ storage: storage });
/**
 * Image upload configuration
 * end
 */





/**
 * DB authentication section starts
 */

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'furry_baby'
});

connection.connect((error, data) => {
  if (error) {
    console.error("Failed to connect...");
    return;
  } else {
    console.log("Connected successfully...");
  }
})

/**
 * DB authentication section ends here
 */


/**
 * Login section starts here
 */

const app = express();
app.use(cors({
  origin: 'http://localhost:3001'
}))



app.use(express.json());

app.use('/uploads', express.static('uploads'))

app.get("/", (req, res) => {
  res.status(200).json({
    message: "My Furry Baby API"
  })
})

app.post("/signin", (req, res) => {
  let logindata = req.body;
  let sqlquery = `call signin(?,?,@stat)`;
  connection.query(sqlquery, [logindata.email, logindata.password], (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed"
      })
    } else {
      console.log("result ", result);
      connection.query("select @stat", (error, result) => {
        if (error) {
          console.error(error);
          res.status(500).json({
            message: "Failed"
          })
        } else {
          console.log("Success ", result[0]['@stat']);
          if (result[0]['@stat'] === 1) {
            let token = jwt.sign({
              email: logindata.email
            }, 'shhh')
            res.status(200).json({
              message: "Signin successfull",
              status: result[0]['@stat'],
              token: token
            })
          } else {
            res.status(200).json({
              message: "Signin failed",
              status: result[0]['@stat'],
            })
          }

        }
      })

    }
  })
})

app.post("/signup", (req, res) => {
  let registerdata = req.body;
  let sqlquery = `call register(?, ?, ?, ?, ?, ?, ?, @result);`
  connection.query(sqlquery, [registerdata.email, registerdata.pass, registerdata.fname, registerdata.lname, registerdata.address, registerdata.city, registerdata.bio], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed"
      })
    } else {
      res.status(200).json({
        message: "Signup successfull"
      })
    }
  })


})

app.get('/check_user_exists/:email', (req, res) => {
  let email = req.params.email;
  let sqlquery = `call check_if_user_exists(?,@result)`
  connection.query(sqlquery, [email], function (err, result) {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed"
      })
    } else {
      console.log(result);
      connection.query('select @result', function (err, result) {
        if (err) {
          console.log(err);
          res.status(500).json({
            message: "Failed"
          })
        } else {
          console.log("Result ", result[0]['@result']);
          res.status(200).json({
            message: "Success",
            status: result[0]['@result']
          })
        }
      })

    }

  })
})

app.get("/get_user_by_email/:email", tokencheck, (req, res) => {
  let email = req.params.email;
  let sqlquery = `call get_user_data_by_email(?)`;
  connection.query(sqlquery, [email], function (error, result) {
    if (error) {
      return res.status(500).json({
        message: "Failed"
      })
    } else {
      return res.status(200).json({
        message: "Success",
        data: result[0]
      })
    }
  })
})

/**
 * Login section ends here
 */


/**
 * Pets section starts here
 */
app.post("/create_pet", tokencheck, function (req, res) {
  let petdata = req.body;
  let sqlquery = `call create_pet(?,?,?,?,?,?,?,?,?,?,?,?)`;
  connection.query(sqlquery, [petdata.petname, petdata.ownername, petdata.ownercontact, petdata.owneremail, petdata.petbreed, petdata.pettype, petdata.pettype, petdata.petimage, petdata.postdate, petdata.status, petdata.detail, petdata.price, petdata.uid], function (error, result) {
    if (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed"
      })
    } else {
      console.log("result ", result);
      res.status(201).json({
        message: "Created successfully"
      })
    }
  })
  // return res.status(200).json({
  //   message:"Success",
  //   data:req.data
  // })
})

app.put("/update_pet/:id", tokencheck, (req, res) => {
  let updated_pet_data = req.body;
  let petid = req.params.id;
  let sql_query = "call update_pet(?,?,?,?,?,?,?,?,?,?,?,?,?);"
  connection.query(sql_query, [
    updated_pet_data.petname,
    updated_pet_data.owner,
    updated_pet_data.owner_contact,
    updated_pet_data.owner_email,
    updated_pet_data.pet_breed,
    updated_pet_data.pettype,
    updated_pet_data.pet_image,
    updated_pet_data.posted_date,
    updated_pet_data.status,
    petid,
    updated_pet_data.details,
    updated_pet_data.price,
    updated_pet_data.uid
  ], function (error, result) {
    if (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed"
      })
    } else {
      console.log("result ", result);
      res.status(200).json({
        message: "Updated successfully"
      })
    }
  })
})

app.delete("/delete_pet/:id", tokencheck, (req, res) => {
  let id = req.params.id;
  let sql_query = "call delete_pet(?)";
  connection.query(sql_query, [id], function (error, result) {
    if (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed"
      })
    } else {
      console.log("result ", result);
      res.status(200).json({
        message: "Deleted successfully"
      })
    }
  })
})

app.get("/get_all_pets", tokencheck, (req, res) => {
  let sql_query = "call get_all_pets()";
  connection.query(sql_query, function (error, result) {
    if (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed"
      })
    } else {
      console.log("result ", result);
      res.status(200).json({
        message: "Success",
        data: result[0]
      })
    }
  })
})

app.get("/get_pet_by_id/:id", tokencheck, (req, res) => {
  let petid = req.params.id;
  let sql_query = "call get_pet_by_id(?)";
  connection.query(sql_query, [petid], function (error, result) {
    if (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed"
      })
    } else {
      console.log("result ", result);
      res.status(200).json({
        message: "Success",
        data: result[0]
      })
    }
  })
})


app.get("/get_pet_by_uid/:id", tokencheck, (req, res) => {
  let uid = req.params.id;
  let sql_query = "call get_pet_by_userid(?)";
  connection.query(sql_query, [uid], function (error, result) {
    if (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed"
      })
    } else {
      console.log("result ", result);
      res.status(200).json({
        message: "Success",
        data: result[0]
      })
    }
  })
})




/**
 * Pets section ends here
 */


/**
 * Image section starts here
 */

app.post('/insert_image', tokencheck, upload.single("dataFile"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send({ message: 'Please upload a file.' });
  } else {
    res.status(200).json({
      message: "File uploaded successfully",
      data: file.filename
    })
  }
})

/**
 * Image section ends here
 */







app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`)
})