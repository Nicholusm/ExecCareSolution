const express = require('express');
const bodyparser = require('body-parser');
const app = express();
let cookieParser = require('cookie-parser');
let session = require('express-session');
const uuid = require('uuid4');
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}))

app.use(cookieParser());



const MSSQLStore = require('connect-mssql')(session);

const config = {
    user: 'sa',
    password: '1964587912Amo',
    server: 'localhost', // You can use 'localhost\\instance' to connect to named instance 
    database: 'HealthManagement',
}
let nocache = require('node-nocache');
app.use(nocache);


/*
app.use(session({
    genid: function (req) {
        return genuuid() // use UUIDs for session IDs
    },
    secret: 'ExecCareUserINtakeForm',
    resave: false,
    saveUninitialized: true
}));
*/

const options = {
    table: 'ec2_sessions'
};

app.use(session({
    store: new MSSQLStore(config, options), // options are optional 
    secret: 'ExecCareUserINtakeForm',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 3600000 * 2
    }
}));


let htmlBuilder = require('./server/buildhtml');
let sqlRunner = require('./server/sqlqueries');
let assessmentStorage = require('./server/formstorage');

function genuuid() {
    return uuid();
}




app.get('/login/:memguid', nocache, (req, res) => {

    res.render('pages/login', {

    });

});

let sessionChecker = (req, res, next) => {

    if (!Boolean(req.session.user)) {
        res.redirect('/ExecCareMobile/Login');
    } else {
        next();
    }
};

app.post('/login',nocache,async (req, res, next) => {

    var OTP = req.body.otp;

    if (OTP) {

        var runner = new sqlRunner();
        let userLoginInformation;
        try {
            userLoginInformation = await runner.OTPMemberVerification(req.body.memguid, OTP);


            if (userLoginInformation.recordset.length > 0) {

                const userVerification = userLoginInformation.recordset[0];

                if (userVerification.OTPActiveTime >= 26) {
                    res.send({
                        error: true,
                        message: "<p style='color:red;'>Inactive OTP, please reissue token </p>"
                    });
                } else {
                    let user = {
                        memberid: userVerification.MemberID,
                        assessmentid: userVerification.AssID,
                        name: userVerification.Name + " " + userVerification.Surname
                    }

                    if (!user.memberid || !user.assessmentid) {

                        res.send({
                            error: true,
                            message: "Member ID or AssessmentID could be found"
                        });
                    } else {
                        req.session.user = user;

                        res.send({
                            error: false
                        });
                    }
                }
            } else {
                res.send({
                    error: true,
                    message: "<p style='color:red;'>** Incorrect OTP </p>"
                });
            }

        } catch (e) {
            res.send({
                error: true,
                message: "<p style='color:red;'>Incorrect member id</p>"
            });
        }
    } else {
        res.send({
            error: true,
            message: "<p style='color:red;'> No OTP Entered </p>"
        });
    }
});

app.get('/AssessmentCategories', sessionChecker,nocache, async (req, res, next) => {

    let user = req.session.user;

    var runner = new sqlRunner();

    let data = await runner.GetSectionsForMemberByMemberId(user.memberid);

    let data2 = await runner.CompletedSections(user.assessmentid);
    const completed_sections = data2.recordset;

    let allData = data.recordset.map(i => {

        for (const key in completed_sections) {

            if (i.Id === completed_sections[key].ID) {
                i.completed_sections = true;
                break;
            } else {
                i.completed_sections = false;
            }
        }

        return i;
    });

    res.render('pages/assessmentgroups', {
        menuItems: allData

    });
});

app.get('/AssessmentCategories/:id', sessionChecker,nocache, async (req, res, next) => {

    try {

        let user = req.session.user;

        var builder = new htmlBuilder();

        var runner = new sqlRunner();

        let recordsets = await runner.GetSectionById(req.params.id);

        builder.transformData(recordsets.recordset, user.memberid, user.assessmentid).then(pageHtml => {
            res.render('pages/assessmentgroup', {
                html: pageHtml,
                category: req.params.id,
                error: []
            });
        });

    } catch (e) {
        res.render('pages/assessmentgroup', {
            html: "",
            category: "",
            error: "Error rendering page"
        });
    }
});

app.post('/AssessmentCategories/submit/:id', sessionChecker,nocache, async (req, res, next) => {

    let user = req.session.user;

    let storage = new assessmentStorage();

    var runner = new sqlRunner();

    var builder = new htmlBuilder();

    await storage.SaveForm(req.params.id, req.body, user.memberid, user.assessmentid, user.OTP);

    res.redirect("/ExecCareMobile/AssessmentCategories");
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));