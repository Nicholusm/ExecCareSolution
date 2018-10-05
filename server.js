var express = require("express");
const bodyparser = require('body-parser');
const app = express();
let cookieParser = require('cookie-parser');
let session = require('express-session');
const uuid = require('uuid4');
app.set('view engine', 'ejs');


let assessmentStorage = require('./server/formstorage');
let htmlBuilder = require('./server/buildhtml');

app.use('/public', express.static('public'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));


app.use('/static', express.static('./node_modules/font-awesome'))
app.use('/static', express.static('./node_modules/font-awesome/css'))

const http = require('http');
const MSSQLStore = require('connect-mssql')(session);

app.use(cookieParser());

const config = {
    user: 'sa',
    password: '1964587912Amo',
    server: 'localhost', // You can use 'localhost\\instance' to connect to named instance 
    database: 'HealthManagement',
}

const options = {
    table: 'ec2_sessions'
};

app.use(session({

    store: new MSSQLStore(config, options), // options are optional 
    secret: 'ExecCareAdmin',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 3600000 * 2
    }

}));

const sqlRunner = require('./server/sqlqueries');

const sessionChecker = (req, res, next) => {


    if (Boolean(req.session.user) === false) {
        res.redirect('/login');
    } else {
        next();
    }
};

app.get('/login/', (req, res) => {

    res.render('pages/login', {

    });

});


app.post('/login/', async (req, res, next) => {

    var runner = new sqlRunner();
    var userName = req.body.username;
    var password = req.body.password;


    let userdetails = await runner.GetUserType(userName, password);

    const details = userdetails[0][0];
    try {


        if (details) {

            let user = {
                name: details.ExecName,
                typeid: details.TypeID,
                userid: details.ExecUserID
            }


            req.session.user = user;

            res.send({
                completed: true

            });
        } else {
            res.send({
                completed: false,
                message: " <p>Incorrect username & password </p>"
            });
        }

    } catch (e) {

    }

});

app.get('/assessments', sessionChecker, async (req, res, next) => {

    res.render('pages/assessments', {});

});

app.get('/events', sessionChecker, async (req, res, next) => {

    var runner = new sqlRunner();

    let calendar = await runner.CalendarData(req.session.user.userid);



    let events = [];

    if (calendar.length > 0) {
        const calenderItems = calendar[0];

        const calendarMapped = calenderItems.map(I => {
            console.log(I);
            return {
                id: I.ID,
                memberid: I.MemGUID,
                title: I.Subject,
                start: I.StartDateTime,
                end: I.EndDateTime
            };


        });



        events = calendarMapped;
    }

    res.send({
        events: events
    });

});

app.get('/AssessmentCategories/:id', sessionChecker, async (req, res, next) => {

    let user = req.session.user;

    var runner = new sqlRunner();

    //Getting the Memguid using MemberID
    const memberInfo = await runner.GetMemberID(req.params.id);
    const memberid = memberInfo[0][0].memberid;

    console.log(memberid);

    let getmemberassesmentid = await runner.GetAssesmentID(memberid);
    const assesmentid = getmemberassesmentid[0][0].AssessmentId;

    let data = await runner.ALLSections(req.session.user.userid, assesmentid, memberid);


    let allData = data[0].map(i => {
        return i;
    });

    res.render('Pages/assesmentgroups', {
        menuItems: allData,
        currentMember: req.params.id
    });
});


app.get('/AssessmentCategories/:memberguid/:catid', sessionChecker, async (req, res, next) => {

    try {

        console.log(req.params);

        let user = req.session.user;

        var builder = new htmlBuilder();

        var runner = new sqlRunner();

        let recordsets = await runner.GetSectionById(req.params.catid);

        const memberInfo = await runner.GetMemberID(req.params.memberguid);
        const memberid = memberInfo[0][0].memberid;

        let getmemberassesmentid = await runner.GetAssesmentID(memberid);
        const assesmentid = getmemberassesmentid[0][0].AssessmentId;

        builder.transformData(recordsets[0], memberid, assesmentid).then(pageHtml => {

            //console.log(pageHtml);

            res.render('Pages/assesmentgroup', {
                html: pageHtml,
                category: req.params.catid,
                memberid: req.params.memberguid,
                error: []
            });
        });

    } catch (e) {
        res.render('Pages/assesmentgroup', {
            html: "",
            category: "",
            error: "Error rendering page"
        });
    }
});

app.post('/AssessmentCategories/submit/:memberguid/:categoryid', sessionChecker, async (req, res, next) => {

    console.log(req.body);

    let user = req.session.user;

    let runner = new sqlRunner();
    const memberInfo = await runner.GetMemberID(req.params.memberguid);
    const memberid = memberInfo[0][0].memberid;

    let getmemberassesmentid = await runner.GetAssesmentID(memberid);
    const assesmentid = getmemberassesmentid[0][0].AssessmentId;

    let storage = new assessmentStorage();

    var builder = new htmlBuilder();

    let completed = await storage.SaveForm(req.params.id, req.body, memberid, assesmentid);

    console.log(completed);

    res.redirect("/AssessmentCategories/" + req.params.memberguid);
});




app.listen(8080, () => console.log('Example app listening on port 8080!'));