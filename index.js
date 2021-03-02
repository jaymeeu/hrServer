const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const rounds = 10;
const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');
const mailer = require('nodemailer')

const db = mysql.createPool({
    host: "hrportalspfx.db.9145261.4bf.hostedresource.net",
    user: "hrportalspfx",
    password: "Lotusbeta@1",
    database: "hrportalspfx"
});

// const db = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "hr_portal"
// });

// const storage = multer.diskStorage({
//     destination: function (req, file, next) {
//       next(null, path.join(path.dirname(__dirname),  'uploads'))
//     },
//     filename: function (req, file, cb) {
//       next(null, shortid.generate() + '-' + file.originalname)
//     }
//   })
// const upload = multer({ storage });

const transporter = mailer.createTransport({
    service: 'gmail',
    auth:{
        user:'rasaqadewuyi@gmail.com',
        pass:'Jaymeeu1994'
    }
});


const verifyJWT = (req, res, next) =>{
     token = req.headers["x-access-token"];
     if(!token){
         res.send("token needed");
     }
     else {
         jwt.verify(token, "secret", (err, decoded)=>{
             if (err){
                 res.json({auth: false, message: "failed"})
             } else {
                 req.userId = decoded.id;
                 next();
             }
         })
     }
}

//middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'uploads')));
// app.use(express.static('public'));
app.use(fileUpload());

    //   //add new adminupload.single('passport'),
  app.post("/api/admin", (req, res) => {
      
   //const passport = upload.single('passport');
      const fullname = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
      const cpassword = req.body.cpassword;
    
      if(req.files){
        var file = req.files.passport;
        var imgName = `http://localhost:3001/public/` + file.name;
       
        if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){
                                
            file.mv('uploads/'+file.name, function(err) {    
                if (err)return res.status(500).send(err);
                if (cpassword !== password){
                    res.send(false)
                   }
                else{
                    bcrypt.hash(password, rounds, async (err, hash)=> {
                        const sqlInsert = "INSERT INTO administrator (name, officialEmail, password, passport) VALUES (?,?,?,?)";
                       await db.query(sqlInsert, [fullname, email, hash, imgName], (err, result) => {
    
                      });  
                    })  
                    res.send(true)
               }
            });
        }else{
         res.send(message = "This format is not allowed , please upload file with '.png','.gif','.jpg'");
        } 
      }
    });

//get staffs/employees data
app.get("/api/employees", (req, res)=>{
    const sqlSelect = "SELECT * FROM staff_profile";
    db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});
//get staffs/employees data
app.get("/api/employeesComplete", (req, res)=>{
    const sqlSelect = "SELECT * FROM staff_profile WHERE RegistrationStatus = 'complete'" ;
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
})

//get staffs/employee data by email
app.get("/admin", async (req, res)=>{
    const StaffID = req.headers["user"]
    const id = JSON.parse(StaffID);
       const sqlSelect = "SELECT * FROM administrator WHERE OfficialEmail = ?";
       await db.query(sqlSelect, id, (err, result) => {
           if (result){
             res.send(result);  
           }
           if(err){
               res.send('error occur')
           } 
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

//get KPI_Score by sn
app.get("/KPI_Score/:sn", (req, res)=>{
    const sn = req.params.sn;
    const sqlSelect = "SELECT * FROM kpiscore WHERE sn = ?";
    db.query(sqlSelect, sn, (err, result) => {
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

 //get number of appraisal submitted
app.get("/kpiScore/count", (req, res)=>{
    const sqlSelect = "SELECT COUNT (*) as count FROM kpiscore";
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
 });

 //get number of employees
app.get("/awaitHR/count", (req, res)=>{
    const sqlSelect = "SELECT COUNT (*) as count FROM kpiscore where hr='' ";
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
 });

//add new staff
app.post("/api/addstaff", (req, res) => {
    const {staffID, firstname, middlename, lastname, email, Pemail }= req.body;
    const select = "SELECT * FROM staff_profile WHERE OfficialEmail = ?";
    const select2 = "SELECT * FROM staff_profile WHERE  staffID = ?";
    const sqlInsert = "INSERT INTO staff_profile (StaffID, FirstName, MiddleName, LastName, DateOfBirth, MobileNumber, CUGNumber, PersonalEmail, OfficialEmail, HomeAddress, MaritalStatus, EmergencyContact_Name, EmergencyContact_MobileNumber, Relationship, EmergencyContact_HomeAddress, RegistrationStatus) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    db.query(select, email, (error, response) =>{
        if(response.length > 0){
           res.send({message:"User Already Exist"});
          // console.log("User Already Exist")
        }
        else{
            db.query(select2, staffID, (neg, pos)=>
                {
                    if(pos.length > 0){
                        res.send({message: "StaffID Already Exist"})
                        // console.log("StaffID Already Exist")
                    }
                    else{
                            db.query(sqlInsert, [staffID,firstname, middlename, lastname,"","","",Pemail, email,"","","","","","","incomplete"], (err, result) => {
                                res.send({message: "saved"})
                            });

                            const mailOptions ={ 
                                from: 'rasaqadewuyi@gmail.com',
                                to: `${Pemail}`,  
                                subject:'Testing',
                                // text:``,  
                                html: `<div><h2>Dear ${firstname} your account have been created log in to your portal to complete your registration</h2></div>`
                            };
                            
                            transporter.sendMail(mailOptions, (err, response)=>{
                                if (err){ console.log(err);
                                    console.log(Pemail)
                                }
                                else{
                                    console.log('Email sent:' + response.response);
                                }
                            }) 
                        }
                });
        }
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


 //delete sectionA question by sn
app.delete("/delete/sectionB/:sn", (req, res )=>{
    const sn = req.params.sn;
    const sqlDelete = "DELETE FROM appraisalSectionB WHERE sn = ?";
    db.query(sqlDelete, sn, (err, result)=>{
    })
})

 //delete user KPI Score
app.delete("/delete/kpi/:sn", (req, res )=>{
    const sn = req.params.sn;
    const sqlDelete = "DELETE FROM kpiscore WHERE sn = ?";
    db.query(sqlDelete, sn, (err, result)=>{
    })
})

//add post
app.put("/nugget", (req, res) => {
    const {heading, post} = req.body;
    const sn = 1;
   
    const sqlUpdate = "UPDATE nugget SET heading = ? , content = ? WHERE sn = ?";
    db.query(sqlUpdate, [heading, post, sn], (err, result) => {
        res.send(result)
    });
  }); 

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

    department.forEach(departs => {
        const sqlInsert = "INSERT INTO AppraisalSectionB (perspectives, measures, objectives, targets, department) VALUES (?,?,?,?,?)";
        db.query(sqlInsert, [perspectives,measures, objectives, targets,departs], (err, result) => {
        console.log(err);
    });  
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

//get top five recently submitted appraisal
app.get("/recentApp", async (req, res)=>{
    const sqlSelect = "SELECT staffID FROM kpiscore ORDER BY sn DESC LIMIT 5" ;
    await db.query(sqlSelect,  (err, result) => {
        const resultt = "jamiu@gmail.com";
    //   res.send(result)
    // console.log(result)
      //  const rst = result.StaffID;

       const first = JSON.parse(JSON.stringify(result[0].staffID));
       const second = JSON.parse(JSON.stringify(result[1].staffID));
       const third = JSON.parse(JSON.stringify(result[2].staffID));
       const fourth = JSON.parse(JSON.stringify(result[3].staffID));
       const fifth = JSON.parse(JSON.stringify(result[4].staffID));
    //    console.log(resultt)
    //    console.log(rs)
      
       
        if(result){
            const sqlSelect2 = "SELECT FirstName, Passport FROM staff_profile WHERE OfficialEmail = ? OR OfficialEmail = ? OR OfficialEmail = ? OR OfficialEmail = ? OR OfficialEmail = ? ORDER BY id DESC";
            db.query(sqlSelect2,[first, second,third,fourth,fifth],  (error, response) => {
            if(response){
                res.send(response)
            }
            else if(error){res.sendStatus(403)}
            }); 
        }
        else{res.sendStatus(404)}
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

//get KPI Score
app.get("/kpiscore", async (req, res)=>{
    const sqlSelect = "SELECT * FROM kpiscore";
    await db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});

//get chart data for dashboard
app.get("/chartData", async (req, res)=>{
    const sqlSelect = "SELECT departmentName, departmentCount FROM department";
    await db.query(sqlSelect,  (err, result) => {
        res.send(result);
    });
});

//get chart data for individual user
app.get("/chartData/user/:id", async (req, res)=>{
    const id = req.params.id;
    const sqlSelect = "SELECT OfficialEmail FROM staff_profile WHERE StaffID = ?";
    await db.query(sqlSelect, id,  (err, result) => {
        const email = (result[0].OfficialEmail);
         if(result){
           const sqlSelect2 = "SELECT quarter, staff,hr, overall FROM kpiscore WHERE staffID = ? ";
                db.query(sqlSelect2, email, (error, response) => {
                res.send(response)
                // res.JSON({response}) 
            });

         }
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
app.get("/checkUser", (req, res) => {
    const username = req.headers.user;
   
 const user = JSON.parse(username);
//   console.log(user)
    const sqlSelect = 'SELECT * FROM administrator WHERE officialEmail = ?';
    db.query(sqlSelect, user, (err, result) => {
      if(err){
          console.log(err)
        } 
      if(result) {res.send(result)} 
    //   else{res.send("Username not autorized")}
    });
  });

  
// //check if username exist
// app.post("/api/checkUser", (req, res) => {
//     const username = req.body.username;
   
//     const sqlSelect = "SELECT * FROM administrator WHERE officialEmail = (?)";
//     db.query(sqlSelect, username, (err, result) => {
//       if(err){
//           console.log(err)
//         } 
//       if(result.length > 0) {res.send(result)} 
//       else{res.send("Username don't exist")}
//     });
//   });

  //login user
// app.post("/api/login", (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;
  
//         const sqlSelect = "SELECT * FROM administrator WHERE officialEmail = ?;";
//         db.query(sqlSelect, username, (err, result) => {
//         if(err){
//               res.send({err: err})
//             } 
//         if(result.length > 0) {
//             bcrypt.compare(password, result[0].password, (error, response) =>{
//                 if(response){
//                     const id = result[0].sn;
//                     const token = jwt.sign({id}, "secret", 
//                     // {expiresIn: 6000,}
//                     )
//                     res.json({auth: true, token: token, result: result })
//                 }
//                 else{res.json({auth: false, message: "incorrect password" })}
//                 })
//             } 
        
//         });
//   });  

//Update user profile
app.put("/update/user/", (req, res )=>{
    const {staffID, role, location, department, level, cug, status} = req.body; 
    
    const checkDepartment = "SELECT Department FROM staff_profile WHERE StaffID = ?"
    db.query(checkDepartment, staffID,(absent, present)=>{
        const FetchedDepart = JSON.parse(JSON.stringify(present[0].Department));
            if(present){
                if (FetchedDepart == department )
                    {
                        const sqlUpdate = "UPDATE staff_profile SET JobRole = ?, Location = ?, Department = ?, Level = ?, CUGNumber = ?, Status = ? WHERE StaffID = ?";
                        db.query(sqlUpdate, [role, location, department, level, cug,status, staffID], (err, result)=>{
                        if(err){
                                console.log('server error')
                                }
                        })
                    }

                else if(FetchedDepart == ''){
                    const selectDeptCount = "SELECT departmentCount FROM department WHERE departmentName = ?"
                        db.query(selectDeptCount, department, (error, response)=>{
                        const num = JSON.parse(JSON.stringify(response[0].departmentCount));
                        const newNumber = num + 1;
                        if(response){
                            const sqlUpdateDept = "UPDATE department SET departmentCount = ? WHERE departmentName = ?";
                            db.query(sqlUpdateDept, [newNumber, department] , (err, result)=>{
                                if(err){
                                    console.log(err)
                                }
                            })
                        }
                        else{console.log('server error')}
                        
                        })
                        const sqlUpdate = "UPDATE staff_profile SET JobRole = ?, Location = ?, Department = ?, Level = ?, CUGNumber = ?, Status = ? WHERE StaffID = ?";
                        db.query(sqlUpdate, [ role, location, department, level, cug,status, staffID], (err, result)=>{
                            if(err){
                                console.log('server error')
                            }
                        })
                }
                else
                    {
                        const selectPrevDeptCount = "SELECT departmentCount FROM department WHERE departmentName = ?"
                        db.query(selectPrevDeptCount, FetchedDepart, (error, response)=>{
                        const num1 = JSON.parse(JSON.stringify(response[0].departmentCount));
                        const newNumber1 = num1 - 1;
                        console.log(newNumber1)
                        if(response){
                            const sqlUpdateDept = "UPDATE department SET departmentCount = ? WHERE departmentName = ?";
                            db.query(sqlUpdateDept, [newNumber1, FetchedDepart] , (err, result)=>{
                                if(err){
                                    console.log(err)
                                }
                            })
                        }
                        else{console.log('server error')}
                        
                        })

                        const selectDeptCount = "SELECT departmentCount FROM department WHERE departmentName = ?"
                        db.query(selectDeptCount, department, (error, response)=>{
                        const num = JSON.parse(JSON.stringify(response[0].departmentCount));
                        const newNumber = num + 1;
                        if(response){
                            const sqlUpdateDept = "UPDATE department SET departmentCount = ? WHERE departmentName = ?";
                            db.query(sqlUpdateDept, [newNumber, department] , (err, result)=>{
                                if(err){
                                    console.log(err)
                                }
                            })
                        }
                        else{console.log('server error')}
                        
                        })

                        const sqlUpdate = "UPDATE staff_profile SET JobRole = ?, Location = ?, Department = ?, Level = ?, CUGNumber = ?, Status = ? WHERE StaffID = ?";
                        db.query(sqlUpdate, [ role, location, department, level, cug,status, staffID], (err, result)=>{
                            if(err){
                                console.log('server error')
                            }
                        })

                    }
                    res.send(true)
                }
            else if(absent){res.send(true)}
            else (res.send(true))
        } )
})


//Update department
app.put("/update/dept/", (req, res )=>{
    const sn =  req.body.sn;
    const manager =  req.body.manager;
    const managerCUG =  req.body.managerCUG;
    if (!managerCUG) {
        const sqlUpdate = "UPDATE department SET  managerName = ? WHERE sn = ?";
        db.query(sqlUpdate, [manager, sn], (err, result)=>{
            if(err){
                console.log(err)
                }
            })
        }
    else{
         const sqlUpdate = "UPDATE department SET  managerName = ?, managerCUG = ? WHERE sn = ?";
        db.query(sqlUpdate, [manager, managerCUG, sn], (err, result)=>{
            if(err){
                console.log(err)
            }
    })
    }
   
})


//Update user role to manager from add-department form
app.put("/update/userFromAddDept/", (req, res )=>{
    const manager =  req.body.manager;
    const managerCUG =  req.body.managerCUG;
    const role = "manager";
    if(!managerCUG){
        const sqlUpdate = "UPDATE staff_profile SET   JobRole = ? WHERE FirstName = ?";
        db.query(sqlUpdate, [role, manager], (err, result)=>{
            if(err){
                console.log(err)
            } 
        })
    }
    else{
        const sqlUpdate = "UPDATE staff_profile SET  CUGNumber = ?, JobRole = ? WHERE FirstName = ?";
        db.query(sqlUpdate, [managerCUG,role, manager], (err, result)=>{
            if(err){
                console.log(err)
            } 
        })
    }
    
})

//Update user KPI score with HR RAting
app.put("/update/kpi/", async (req, res )=>{
    const {hrRating, sn, staffRating} =  req.body;
    const overall = parseInt(hrRating) + parseInt(staffRating);
    
    const sqlUpdate = "UPDATE kpiscore SET  hr = ?, overall = ? WHERE sn = ?";
    await db.query(sqlUpdate, [hrRating, overall, sn], (err, result)=>{
        if(result){
            res.send(true)
        }
        else{
            res.send(false)
        }
    })
})

//Update section A Question
app.put("/update/sectA/", (req, res )=>{
    const {sn, Title, Description} =  req.body;
    const sqlUpdate = "UPDATE appraisalsectiona SET  Title = ?, Description = ? WHERE SN = ?";
        db.query(sqlUpdate, [Title, Description, sn], (err, result)=>{
            if(err){
                console.log(err)
            }
        })
    
})

//Update section B Question
app.put("/update/sectB/", (req, res )=>{
    const {sn, Targets, Perspectives, Objectives,Measures, Department } =  req.body;
    const sqlUpdate = "UPDATE appraisalsectionb SET  perspectives = ?, measures = ? , objectives = ? , Targets = ? , department = ? WHERE sn = ?";
    db.query(sqlUpdate, [ Perspectives, Measures, Objectives, Targets, Department, sn], (err, result)=>{
        if(err){
            console.log(err)
        }
    })
})

var server = app.listen(3001, ()=>{
    var port = server.address().port
    console.log('Running on port ' + port)
}); 



//get request testing
// app.get("/api/get", (req, res)=>{
//     const sqlSelect = "SELECT * FROM test";
//     db.query(sqlSelect,  (err, result) => {
//         res.send(result);
//     });
// });

// post request
// app.post("/test/insert", (req, res) => {
//   const firstname = req.body.firstname;
//   const address = req.body.address;
//   const sqlInsert = "INSERT INTO test (firstname, address) VALUES (?,?)";
//   db.query(sqlInsert, [firstname, address], (err, result) => {
//       console.log(err);
//   });
// });

//delete request
// app.delete("/api/delete/:firstname", (req, res )=>{
//     const name = req.params.firstname;
//     const sqlDelete = "DELETE FROM test WHERE firstname = ?";
//     db.query(sqlDelete, name, (err, result)=>{

//     })
// })

//Update request
// app.put("/api/update/", (req, res )=>{
//     const firstname = req.body.firstname;
//     const address = req.body.address;

//     const sqlUpdate = "UPDATE test SET address = ? WHERE firstname = ?";
//     db.query(sqlUpdate, [address, firstname], (err, result)=>{
//         console.log(result);

//     })
// })

 