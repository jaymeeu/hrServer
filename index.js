const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors")
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "hr_portal"
});

//middleware
app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));


//get staffs/employees data
app.get("/api/employees", (req, res)=>{
    const sqlSelect = "SELECT * FROM staff_profile";
    db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});

//get staff/employee data by ID 
app.get("/api/employee/:id", (req, res)=>{
     const id = req.params.id;
    const sqlSelect = "SELECT * FROM staff_profile WHERE StaffID = ?";
    db.query(sqlSelect, id, (err, result) => {
        res.send(result);
    });
});

//get staffs/employee data by email
app.get("/admin/:officialEmail", (req, res)=>{
    const email = req.params.officialEmail;
   const sqlSelect = "SELECT * FROM administrator WHERE officialEmail = ?";
   db.query(sqlSelect, email, (err, result) => {
       res.send(result);
   });
});

//get staffs/employee data by email
app.get("/employee/:email", (req, res)=>{
    const email = req.params.email;
   const sqlSelect = "SELECT * FROM staff_profile WHERE OfficialEmail = ?";
   db.query(sqlSelect, email, (err, result) => {
       res.send(result);
   });
});

//get number of employees
app.get("/employees/count", (req, res)=>{
   const sqlSelect = "SELECT COUNT (*) as count FROM staff_profile";
   db.query(sqlSelect, (err, result) => {
       res.send(result);
   });
});

//get number of departments
app.get("/depts/count", (req, res)=>{
    const sqlSelect = "SELECT COUNT (*) as count FROM department";
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
 });

//add new staff
app.post("/api/addstaff", (req, res) => {
    const staffID = req.body.staffID;
    const firstname = req.body.firstname;
    const middlename = req.body.middlename;
    const lastname = req.body.lastname;
    const email = req.body.email;

    const sqlInsert = "INSERT INTO staff_profile (StaffID, FirstName, MiddleName, LastName, DateOfBirth, MobileNumber, CUGNumber, PersonalEmail, OfficialEmail, HomeAddress, MaritalStatus, EmergencyContact_Name, EmergencyContact_MobileNumber, Relationship, EmergencyContact_HomeAddress, RegistrationStatus) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    db.query(sqlInsert, [staffID,firstname, middlename, lastname,"","","","", email,"","","","","","","incomplete"], (err, result) => {
        console.log(err);
    });
  });

  //delete staff by StaffID
app.delete("/api/delete/employee/:StaffID", (req, res )=>{
    const staffID = req.params.StaffID;
    const sqlDelete = "DELETE FROM staff_profile WHERE StaffID = ?";
    db.query(sqlDelete, staffID, (err, result)=>{

    })
})

  //delete department by sn
  app.delete("/api/delete/department/:sn", (req, res )=>{
    const sn = req.params.sn;
    const sqlDelete = "DELETE FROM department WHERE sn = ?";
    db.query(sqlDelete, sn, (err, result)=>{
    })
})

 //delete sectionA question by sn
 app.delete("/delete/sectionA/:sn", (req, res )=>{
    const sn = req.params.sn;
    const sqlDelete = "DELETE FROM appraisalSectionA WHERE sn = ?";
    db.query(sqlDelete, sn, (err, result)=>{
    })
})

app.delete("/delete/sectionB/:sn", (req, res )=>{
    const sn = req.params.sn;
    const sqlDelete = "DELETE FROM appraisalSectionB WHERE sn = ?";
    db.query(sqlDelete, sn, (err, result)=>{
    })
})

//add new question to appraisal SectionA
app.post("/api/Appraisal/SectionA/Upload", (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
   
    const sqlInsert = "INSERT INTO AppraisalSectionA (Title, Description) VALUES (?,?)";
    db.query(sqlInsert, [title,description], (err, result) => {
        console.log(err);
    });
  });

//add new question to appraisal SectionB
app.post("/api/Appraisal/SectionB/Upload", (req, res) => {
    const perspectives = req.body.perspectives;
    const measures = req.body.measures;
    const objectives = req.body.objectives;
    const targets = req.body.targets;
    const department = req.body.department;
   
    const sqlInsert = "INSERT INTO AppraisalSectionB (perspectives, measures, objectives, targets, department) VALUES (?,?,?,?,?)";
    db.query(sqlInsert, [perspectives,measures, objectives, targets,department], (err, result) => {
        console.log(err);
    });
  });

//add new location
app.post("/api/addlocation", (req, res) => {
    const location = req.body.location;
    const address = req.body.address;
    const sqlInsert = "INSERT INTO location (location, address) VALUES (?,?)";
    db.query(sqlInsert, [location,address], (err, result) => {
        console.log(err);
    });
  });

//get location
app.get("/api/location", (req, res)=>{
    const sqlSelect = "SELECT * FROM location";
    db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});

//get jobroles
app.get("/api/jobrole", (req, res)=>{
    const sqlSelect = "SELECT * FROM jobroles";
    db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});



//add new departmnt
app.post("/api/addDepartment", (req, res) => {
    const department = req.body.department;
    const location = req.body.location;
    const manager = req.body.manager;
    const CUG = req.body.managerCUG;

    const sqlInsert = "INSERT INTO department (departmentName, location,managerName,managerCUG) VALUES (?,?,?,?)";
    db.query(sqlInsert, [department,location,manager,CUG], (err, result) => {
        console.log(err);
    });
  });

//get departments
app.get("/api/departments", (req, res)=>{
    const sqlSelect = "SELECT * FROM department";
    db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});
 
//add new job role
app.post("/api/addJobRole", (req, res) => {
    const department = req.body.department;
    const jobRole = req.body.jobRole;
    
    const sqlInsert = "INSERT INTO jobRoles (jobRole, department) VALUES (?,?)";
    db.query(sqlInsert, [jobRole,department], (err, result) => {
        console.log(err);
    });
  });

  //add new admin
app.post("/api/admin", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    
    const sqlInsert = "INSERT INTO administrator (name, officialEmail, password) VALUES (?,?,?)";
    db.query(sqlInsert, [name,email, password], (err, result) => {
        console.log(err);
    });
  });

//get sectionA question
app.get("/sectionA", (req, res)=>{
    const sqlSelect = "SELECT * FROM appraisalSectionA";
    db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});

//get sectionB question
app.get("/sectionB", (req, res)=>{
    const sqlSelect = "SELECT * FROM appraisalSectionB";
    db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});

//get department data by sn 
app.get("/api/department/:sn", (req, res)=>{
    const sn = req.params.sn;
   const sqlSelect = "SELECT * FROM department WHERE sn = ?";
   db.query(sqlSelect, sn, (err, result) => {
       res.send(result);
   });
});

//get section A  by sn 
app.get("/sectA/:sn", (req, res)=>{
    const sn = req.params.sn;
   const sqlSelect = "SELECT * FROM appraisalsectiona WHERE SN = ?";
   db.query(sqlSelect, sn, (err, result) => {
       res.send(result);
   });
});

//get section B  by sn 
app.get("/sectB/:sn", (req, res)=>{
    const sn = req.params.sn;
   const sqlSelect = "SELECT * FROM appraisalsectionb WHERE sn = ?";
   db.query(sqlSelect, sn, (err, result) => {
       res.send(result);
   });
});

//check if username exist
app.post("/api/checkUser", (req, res) => {
    const username = req.body.username;
   
    const sqlSelect = "SELECT * FROM administrator WHERE officialEmail = (?)";
    db.query(sqlSelect, username, (err, result) => {
      if(err){
          console.log(err)
        } 
      if(result.length > 0) {res.send(result)} 
      else{res.send("Username don't exist")}
    });
  });

  //login user
app.post("/api/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
   
    const sqlSelect = "SELECT * FROM administrator WHERE officialEmail = (?) AND password = (?)";
    db.query(sqlSelect, [username, password], (err, result) => {
      if(err){
          res.send({err: err})
        } 
      if(result.length > 0) {res.send(result)} 
      else{res.send("Password Mismatch")}
    });
  });

//Update user profile
app.put("/update/user/", (req, res )=>{
    const staffID =  req.body.staffID;
    const role =  req.body.role;
    const location =  req.body.location;
    const department =  req.body.department;
    const level =  req.body.level;
    const cug =  req.body.cug;
    const status =  req.body.status;

    const sqlUpdate = "UPDATE staff_profile SET JobRole = ?, Location = ?, Department = ?, Level = ?, CUGNumber = ?, Status = ? WHERE StaffID = ?";
    db.query(sqlUpdate, [role, location, department, level, cug,status, staffID], (err, result)=>{
        if(err){
            console.log('server error')
        }
    })
})


//Update user profile
app.put("/update/dept/", (req, res )=>{
    const sn =  req.body.sn;
    const manager =  req.body.manager;
    const managerCUG =  req.body.managerCUG;

    const sqlUpdate = "UPDATE department SET  managerName = ?, managerCUG = ? WHERE sn = ?";
    db.query(sqlUpdate, [manager, managerCUG, sn], (err, result)=>{
        if(err){
            console.log(err)
        }
    })
})









//get request testing
app.get("/api/get", (req, res)=>{
    const sqlSelect = "SELECT * FROM test";
    db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});

// post request
app.post("/api/insert", (req, res) => {
  const firstname = req.body.firstname;
  const address = req.body.address;
  const sqlInsert = "INSERT INTO test (firstname, address) VALUES (?,?)";
  db.query(sqlInsert, [firstname, address], (err, result) => {
      console.log(err);
  });
});

//delete request
app.delete("/api/delete/:firstname", (req, res )=>{
    const name = req.params.firstname;
    const sqlDelete = "DELETE FROM test WHERE firstname = ?";
    db.query(sqlDelete, name, (err, result)=>{

    })
})

//Update request
app.put("/api/update/", (req, res )=>{
    const firstname = req.body.firstname;
    const address = req.body.address;

    const sqlUpdate = "UPDATE test SET address = ? WHERE firstname = ?";
    db.query(sqlUpdate, [address, firstname], (err, result)=>{
        console.log(result);

    })
})

app.listen(3001, ()=>{
    console.log("running on port 3001");
}); 