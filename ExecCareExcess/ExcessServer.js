var express = require("express");
const bodyparser = require("body-parser");
const app = express();
let cookieParser = require("cookie-parser");
let session = require("express-session");

const uuid = require("uuid4");
app.set("view engine", "ejs");

let assessmentStorage = require("./server/Excess/formstorage");
let htmlBuilder = require("./server/Excess/buildhtml");
let utilities = require("./server/core/utilities");

app.use("/public", express.static("public"));

app.use(bodyparser.json());
app.use(
  bodyparser.urlencoded({
    extended: true
  })
);

var moment = require("moment");
var _ = require("underscore");
var ejs = require("ejs");

app.use("/static", express.static("./node_modules/font-awesome"));
app.use("/static", express.static("./node_modules/font-awesome/css"));

const http = require("http");
const MSSQLStore = require("connect-mssql")(session);

app.use(cookieParser());

const config = {
  user: "sa",
  password: "1964587912Amo",
  server: "localhost", // You can use 'localhost\\instance' to connect to named instance
  database: "HealthManagement"
};

const options = {
  table: "ec2_sessions"
};

app.use(
  session({
    store: new MSSQLStore(config, options), // options are optional
    secret: "ExecCareAdmin",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 3600000 * 2
    }
  })
);

const sqlRunner = require("./server/Excess/sqlqueries");

const sessionChecker = (req, res, next) => {
  if (Boolean(req.session.user) === false) {
    res.redirect("/ExeccareProfessionalServices/login");
  } else {
    next();
  }
};

app.get("/login/", (req, res) => {
  console.log("Getting Login");

  res.render("Pages/Excess/login", {});
});

app.post("/login/", async (req, res, next) => {
  var runner = new sqlRunner();
  var userName = req.body.username;
  var password = req.body.password;

  let userdetails = await runner.GetUserType(userName, password);

  const details = userdetails.recordset[0];

  try {
    if (details) {
      let user = {
        name: details.ExecName,
        typeid: details.TypeID,
        userid: details.ExecUserID
      };
      req.session.user = user;

      res.send({
        completed: true
      });

      if (true && req.session.user.typeid == 1) {
        res.redirect("/adminhome");
      } else {
        console.log("Getting the calender page!!!");
        res.send("/assessments", {
          authenticateduser: req.session.user
        });
      }
    } else {
      res.send({
        completed: false,
        message: " <p>Incorrect username & password </p>"
      });
    }
  } catch (e) {}
});

app.get("/assessments", sessionChecker, async (req, res, next) => {
  res.render("Pages/Excess/assessments", {});
});

app.get("/events", sessionChecker, async (req, res, next) => {
  var runner = new sqlRunner();

  let calendar = await runner.CalendarData(req.session.user.userid);

  let events = [];

  if (calendar.recordsets[0].length > 0) {
    const calenderItems = calendar.recordsets[0];

    const calendarMapped = calenderItems.map(I => {
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

app.get("/adminhome/", async (req, res, next) => {
  console.log("Getting admin");

  res.render("Pages/Excess/home", {});
});

app.post("/deleteDate/:startdatetime/:memberid", async (req, res, next) => {
  const runner = new sqlRunner();

  let startDate = moment(req.params.startdatetime).format(
    "YYYY-MM-DD HH:mm:ss"
  );
  console.log(startDate);

  const data = await runner.DeleteDate(startDate, req.params.memberid);

  res.render("Pages/Excess/home", {});
});

//Getting Executives
app.get(
  "/getExecutives/:page/:searchname/:searchsurname/:searchemail/:searchclient/:searchstatus",
  async (req, res, next) => {
    var runner = new sqlRunner();

    let searchname = req.params.searchname!= "-" ? req.params.searchname : "";
    let searchsurname = req.params.searchsurname!= "-" ? req.params.searchsurname : "";
    let searchemail = req.params.searchemail!= "-" ? req.params.searchemail : "";
    let searchclient = req.params.searchclient!= "-" ? req.params.searchclient : "";
    let searchstatus =  req.params.searchstatus!= "-" ? req.params.searchstatus : "";


    let data = await runner.GetExecutives(
      2,
      1,
      req.params.page,
      100,
      searchname,
      searchsurname,
      searchemail,
      searchclient,
      searchstatus
    );
    let count = await runner.CountExecutives(
      2,
      1,
      searchname,
      searchsurname,
      searchemail,
      searchclient,
      searchstatus
    );

    res.send({ data: data.recordset, Counts: count.recordset[0] });
  }
);

app.get("/getDates/:memguid", utilities.nocache, async (req, res, next) => {
  const runner = new sqlRunner();

  const data = await runner.GetDates(req.params.memguid);

  if (data.recordset.length > 0) {
    let date = data.recordset[0].StartDate;

    const startdatetime = moment(date).format("DD MMMM YYYY hh:mm A");
    res.send({ startingDate: startdatetime });
  } else {
    res.send({ startingDate: null });
  }
});

app.get("/AssessmentCategories/:id", sessionChecker, async (req, res, next) => {
  let user = req.session.user;

  var runner = new sqlRunner();

  const memberInfo = await runner.GetMemberID(req.params.id);
  const memberid = memberInfo.recordset[0].memberid;
  let getmemberassesmentid = await runner.GetAssesmentID(memberid);
  const assesmentid = getmemberassesmentid.recordset[0].AssessmentId;
  console.log(req.session.user.userid);
  let data = await runner.ALLSections(
    req.session.user.userid,
    assesmentid,
    memberid
  );

  let allData = data.recordsets[0].map(i => {
    return i;
  });

  res.render("Pages/Excess/assesmentgroups", {
    menuItems: allData,
    currentMember: req.params.id
  });
});

app.get(
  "/AssessmentCategories/:memberguid/:catid",
  sessionChecker,
  async (req, res, next) => {
    try {
      let user = req.session.user;

      var builder = new htmlBuilder();

      var runner = new sqlRunner();

      let data = await runner.GetSectionById(req.params.catid);

      const memberInfo = await runner.GetMemberID(req.params.memberguid);
      const memberid = memberInfo.recordset[0].memberid;

      let getmemberassesmentid = await runner.GetAssesmentID(memberid);
      const assesmentid = getmemberassesmentid.recordset[0].AssessmentId;

      builder
        .transformData(data.recordsets[0], memberid, assesmentid)
        .then(pageHtml => {
          res.render("Pages/Excess/assesmentgroup", {
            html: pageHtml,
            category: req.params.catid,
            memberid: req.params.memberguid,
            error: []
          });
        });
    } catch (e) {
      res.render("Pages/Excess/assesmentgroup", {
        html: "",
        category: "",
        error: "Error rendering page"
      });
    }
  }
);

app.post(
  "/AssessmentCategories/submit/:memberguid/:categoryid",
  sessionChecker,
  async (req, res, next) => {
    let user = req.session.user;

    let runner = new sqlRunner();
    const memberInfo = await runner.GetMemberID(req.params.memberguid);
    const memberid = memberInfo.recordset[0].memberid;

    let getmemberassesmentid = await runner.GetAssesmentID(memberid);
    const assesmentid = getmemberassesmentid.recordset[0].AssessmentId;

    let storage = new assessmentStorage();

    var builder = new htmlBuilder();

    let completed = await storage.SaveForm(
      req.params.id,
      req.body,
      memberid,
      assesmentid
    );

    res.redirect("/AssessmentCategories/" + req.params.memberguid);
  }
);

var test = true;

//app.listen(test ? 3104 : 3102, () => console.log('Example app listening on port 3102!'));
app.listen(3102, () => console.log("Example app listening on port 3102!"));
