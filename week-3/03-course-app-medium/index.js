const express = require('express')
const jwt = require("jsonwebtoken")

const app = express();

app.use(express.json());

let ADMIN = [];
let USER = [];
let COURSES = [];

//Creating the jwt
function createJwt(user){
    return jwt.sign({username: user.username} , "TOKEN" , {expiresIn : "1800s"})
}

const  jwtAuth = (req,res,next) => {
    const headerAuth = req.headers.authorization;

    if(headerAuth){
        const token = headerAuth.split(' ')[1];

        jwt.verify(token , "TOKEN" , (err,user)=>{
            if(err){console.log(err)}
            req.user = user;
            next();
        })
    }
    else{
        res.sendStatus(401);
    }

}

app.post('/admin/signup' , (req,res)=>{
    const {username , password} = req.body;
    const existing = ADMIN.find(a => a.username === username)
    if(existing){
        res.status(403).send({msg : "This user already exist"})
    }
    else{
        ADMIN.push({username,password})
        const token = createJwt({username})
        res.status(200).send({msg : "A New Admin Is Created" , token})
    }
})

app.post('/admin/login' , (req,res)=>{
    const {username , password} = req.body;
    const admin = ADMIN.find(a => a.username === username && a.password === password)
    
    if(admin){
        const token = createJwt({username})
        res.send({msg : "You have logged in" , token})
    }
    else{
        res.send({msg : "Admin Auth Failed"})
    }
})

app.post('/admin/courses' , jwtAuth , (req,res)=>{
    const course = req.body;
    course.id = COURSES.length + 1;
    COURSES.push(course)
    res.json({msg : "Course created successfully" , courseID : course.id})
})

app.put('/admin/courses/:courseId', jwtAuth , (req,res)=>{
    const courseId = parseInt(req.params.courseId);
    const {title , body} = req.body;
    if(!COURSES[courseId]){
        return res.send({msg : "The course does not exist"})
    }
    else{
        COURSES[courseId].title = title;
        COURSES[courseId].body = body;
        res.send({msg : "The selected course is updated"})
    }
})

app.get('/admin/courses' , jwtAuth ,(req,res)=>{
    res.send({COURSES})
})

app.post('/users/signup' , (req,res)=>{
    const {username , password} = req.body;
    const existing = USER.find(a => a.username === username)

    const token = createJwt({username});

    if(existing){
        res.send({msg : "The user already exist"})
    }
    else{
        USER.push({username , password})
        res.send({msg: "The user successfully created" , token})
    }
})

app.post('/users/login' , (req,res)=>{
    const {username , password} = req.body;
    const user = USER.find(a => a.username === username && a.password === password)

    if(user){
        const token = createJwt({username})
        res.send({msg : "Logged in successfully" , token})
    }
    else{
        res.send({msg : "Failed to login"})
    }

})

app.get("/users/courses" , jwtAuth , (req,res)=>{
    res.send({COURSES})
})

app.post('/users/courses/:courseId' , jwtAuth , (req,res)=>{
    const courseId = parseInt(req.params.courseId)
    const course = COURSES.find(c => c.id = courseId)
    const {username} = req.body;
    const user = USER.find(a=> a.username === username)
    if(!COURSES[courseId]){
        res.send("Course does not exist")
    }
    else{
        if(user){
            if(!user.purchasedCourse){
                user.purchasedCourse = [];
            }
            user.purchasedCourse.push(course)
            res.send({msg : "Course Purchased"})
        }
        else{
            res.send({msg : "User not found"})
        }
    }
})

app.get('/users/courses/purchasedCourses' , jwtAuth , (req,res)=>{
    const {username} = req.body;
    const user = USER.find(u => u.username === username)

    if(user && user.purchasedCourse){
        res.send({purchasedCourse : user.purchasedCourse})
    } else {
        res.send({msg : "No courses purchased"})
    }
})

app.listen(3000, ()=>{console.log("The server is running on port 3000")})
