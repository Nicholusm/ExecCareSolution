const _ = require('underscore');
const sql = require('../excess/sqlqueries');
const sqlquery = new sql();

function HtmlBuilder() {

    const textFieldFunction = async (memberId, assessmentId, questionId) => {



        let data = await sqlquery.GetOptionByQuestionId(questionId);

        const hasoptionid = data.recordset.length;

        const optionid = hasoptionid > 0 ? data.recordset[0].OptionId : 0;


        let htmlField = "";
        let value = "";

        if (optionid != 0) {
            let htmlValue = await sqlquery.GetProfileAlphanumericValues(memberId, optionid);

            value = htmlValue.recordset.length > 0 ? htmlValue.recordset[0].OptionValue : '';

        } else {

            let htmlValue = "";

            if (questionId === 226) {
                htmlValue = await sqlquery.GetCharacterAnswered(memberId, assessmentId, 53);
            } else {
                htmlValue = await sqlquery.GetCharacterAnswered(memberId, assessmentId, questionId);
            }

            value = htmlValue.recordset.length > 0 ? htmlValue.recordset[0].AnswerText : '';


        }


        if (questionId == 1 || questionId == 2 || questionId == 3 ||
            questionId == 219 || questionId == 646 || questionId == 647 || questionId == 8) {

            if (questionId == 6 || questionId == 8) {

                value = GetDateFormat(value);

                return `<label class='col-sm-2 col-form-label' for='${questionId}'></label><input type='date' class='form-control' id='${questionId}' name='${questionId}'value='${value}'/>`;
            } else {
                return `<label class='col-sm-2 col-form-label' for='${questionId}'></label><input type='text' class='form-control' id='${questionId}' name='${questionId}'value='${value}' required/>`;
            }

        } else {

            if (questionId == 773 || questionId == 730 || questionId == 734 || questionId == 739) {
                value = GetDateFormat(value);

                return `<label class='col-sm-2 col-form-label' for='${questionId}'></label><input type='date' class='form-control' id='${questionId}' name='${questionId}'  value='${value}'  class='required'/>`
            } else {
                return `<label class='col-sm-2 col-form-label' for='${questionId}'></label><input type='text' class='form-control' id='${questionId}' name='${questionId}'  value='${value}' class='required'/>`
            }
        }
    }

    const GetDateFormat = function (datein) {

        if (!datein) return "";
        let dateobject = new Date(datein);

        let year = dateobject.getFullYear();
        let month = ('0' + (dateobject.getMonth() + 1)).slice(-2);
        let day = ('0' + dateobject.getDate()).slice(-2);

        return year + "-" + month + "-" + day;
    }

    const TextAreaFunction = async (memberId, assessmentId, questionId) => {
        let value = "";
        htmlValue = await sqlquery.GetCharacterAnswered(memberId, assessmentId, questionId);

        value = htmlValue.recordset.length > 0 ? htmlValue.recordset[0].AnswerText : '';

        return `<label for='${questionId}'></label> <textarea class='form-control' name='${questionId}' id='${questionId}'>${value}</textarea>`;
    }



    const HtmlEditor = async (memberId, assessmentId, questionId) => {
        let value = "";
        htmlValue = await sqlquery.ExecCareProfHtmlValues(memberId, assessmentId, questionId);

        value = htmlValue.recordset.length > 0 ? htmlValue.recordset[0].Html : '';

        //return `<label for='${questionId}'></label> <textarea class='form-control' name='${questionId}' id='${questionId}'>${value}</textarea>`;

        return `<label for='${questionId}'></label> <textarea class='form-control' name='${questionId}' id='summernote'>${value}</textarea>`;
    }

    const NumericField = async (memberid, assessmentId, questionId) => {

        let data = await sqlquery.GetNumericAnswered(assessmentId, questionId)

        if (data.length > 0) {
            const record = data.recordset[0];

            return `<label class='col-sm-2 col-form-label' for='${questionId}'></label><input type='number' class='form-control' id='${questionId}' name='${questionId}'  value='${record.AnserValue}' class='required'/>`
        } else {
            return `<label class='col-sm-2 col-form-label' for='${questionId}'></label><input type='number' class='form-control' id='${questionId}' name='${questionId}'  value='0' class='required'/>`
        }
    }

    const ECGTable = async (memberId, assessmentId, questionId) => {

        return "<input name='input' value='123' >";

    }

    const CheckBoxFunction = async (memberId, assessmentId, questionId) => {

        let data = await sqlquery.GetOptionByQuestionId(questionId);
        const hasoptionid = data.recordset[0];

        let htmlField = "";
        let value = "";

        const optionid = hasoptionid > 0 ? data.recordset[0].OptionId : 0;

        if (optionid === 0) {

            let htmlValue = await sqlquery.GetAnswerByQuestionId(questionId, memberId);

            const answerSheet = await sqlquery.GetCheckedBox(assessmentId, questionId);

            if (htmlValue.length > 0) {

                for (let key in htmlValue[0]) {

                    const HtmlValueItem = htmlValue[0][key];

                    let doesExistsInAnswerSheet = false;

                    const option = htmlValue[key];

                    for (let answerKey in answerSheet[0]) {
                        const answer = answerSheet[0][answerKey];

                        if (HtmlValueItem.ID === answer.ID) {
                            doesExistsInAnswerSheet = true;

                            break;
                        }
                    }

                    if (doesExistsInAnswerSheet) {
                        htmlField += `<div class="form-check"><label class='form-check-label'> <input type='checkbox' class="form-check-input" checked='checked' name='${questionId}' id='${HtmlValueItem.ID}' value='${HtmlValueItem.ID}'> ${option.AnswerHtml}</label></div>`;
                    } else {

                        htmlField += `<div class="form-check"><label class='form-check-label'> <input type='checkbox' class="form-check-input" name='${questionId}' id='${HtmlValueItem.ID}' value='${HtmlValueItem.ID}'> ${option.AnswerHtml}</label></div>`;
                    }

                }

                return htmlField;


            } else {

            }

        } else {

        }

    }

    const RadioBoxFuction = async (memberId, assessmentId, questionId) => {

        console.log(memberId);

        let data = await sqlquery.GetOptionByQuestionId(questionId);

        const hasoptionid = data.recordset[0];

        const optionid = hasoptionid > 0 ? data.recordset[0].OptionId : 0;

        let htmlField = "";
        let value = "";

        if (optionid != 0) {
            let data = await sqlquery.GetLookupAnswerByOptionId(optionid, memberId);

            if (data.recordset[0].length > 0) {

                for (const key in data[0]) {

                    const option = data.recordset[key];

                    if (option.ValueId === option.SelectedId) {
                        htmlField += `<label class="radio-inline form-control"><input  id="${questionId}" value="${option.ValueId}" type="radio" name="${questionId}" checked="checked">${option.DisplayName}</label>`;
                    } else {
                        htmlField += `<label class="radio-inline form-control"><input id="${questionId}" value="${option.ValueId}" type="radio" name="${questionId}">${option.DisplayName}</label>`;
                    }
                }

                return htmlField;

            } else {

            }

        } else {
            const questionAnswers = await sqlquery.GetAnswerByQuestionId(questionId, memberId);

            console.log(questionAnswers.recordsets[0]);

            const mydata = questionAnswers.recordsets[0];

            for (const key in mydata) {

                const option = mydata[key];

                console.log("Option To Use : ", option);

                if (option.ID === option.SelectedId) {
                    htmlField += `<label class="radio-inline form-control"><input id="${questionId}" value="${option.ID}" type="radio" name="${questionId}" checked="checked">${option.AnswerHtml}</label>`;

                } else {
                    htmlField += `<label class="radio-inline form-control"><input id="${questionId}" value="${option.ID}" type="radio" name="${questionId}">${option.AnswerHtml}</label>`;
                }
            }
            return htmlField;
        }
    }
    const ComboxBoxFunction = async (memberId, assessmentId, questionId) => {
        let htmlField = "";
        let value = "";
        let data = await sqlquery.GetOptionByQuestionId(questionId);

        const hasoptionid = data.recordset[0];

        const optionid = hasoptionid > 0 ? data.recordset[0].OptionId : 0;

        let htmlValue = await sqlquery.GetAnswerByQuestionId(questionId, memberId);

        htmlField += `<select name=${questionId} id=' ${questionId}' class='form-control'>`;

        for (let key in htmlValue[0]) {

            const option = htmlValue[0][key];

            if (option.ID == option.SelectedId) {
                htmlField += `<option value=${option.ID} name= ${questionId} selected='selected'>${option.AnswerHtml} </option>`;
            } else {
                htmlField += `<option value=${option.ID} name= ${questionId} >  ${option.AnswerHtml} </option>`;
            }
        }

        htmlField += "</select>";

        return htmlField;

    }

    this.ControlFactory = async (controltype, memberId, assessmentId, questionId) => {


        switch (controltype) {
            case 1:
                {
                    const html = await RadioBoxFuction(memberId, assessmentId, questionId)
                    return html;
                }
            case 2:
                {
                    const html = await CheckBoxFunction(memberId, assessmentId, questionId);
                    return html;
                }

            case 3:
                {
                    const html = await textFieldFunction(memberId, assessmentId, questionId);
                    return html;
                }
            case 4:
                {
                    const html = await ComboxBoxFunction(memberId, assessmentId, questionId)

                    return html;
                }
            case 5:
                {
                    const html = await NumericField(memberId, assessmentId, questionId)

                    return html;
                }

            case 6:
                {
                    const html = await TextAreaFunction(memberId, assessmentId, questionId)

                    return html;
                }
            case 7:
                {
                    const html = await HtmlEditor(memberId, assessmentId, questionId)
                    return html;
                }
            default:
                {
                    return "Not Implemented"
                }
        }

    }

    this.BuildHtmlPage = async (list, memberId, assessmentId) => {

        let html = "";

        for (const key in list) {
            const question = list[key];

            html += "<div class='form-group'>"

            let htmlItem = await this.ControlFactory(question.controlType, memberId, assessmentId, question.QuestionId);

            if (question.controlType > 0 && question.controlType < 20) {
                if (htmlItem && htmlItem != 'undefined') {

                    html += `<label for="${question.QuestionId}">${question.QuestionHtml}</label>`;
                    html += `${htmlItem}`;
                }
            } else {
                html += `<h4 class='subheadings'>${question.QuestionHtml}</h4>`;
            }

            html += "</div>";
        }

        return html;
    }

    this.getGrandChildren = function (data, currentQuestion, resolve) {
        for (const key in data) {
            //Main Questions List
            const q = data[key];

            if (currentQuestion.QuestionId == q.ParentID) {
                resolve(q);
            }
        }
    }

    this.GetChildren = function (data, currentQuestion, resolve) {

        for (const key in data) {
            //Main Questions List
            const q = data[key];

            if (currentQuestion.QuestionId == q.ParentID) {
                resolve(q);
            }
        }
    }

    this.transformData = async (data, memberId, assessmentId) => {
        try {
            let displaylist = [];

            for (const key in data) {

                const q = data[key];

                const questionexists = _.findWhere(displaylist, {
                    QuestionId: q.QuestionId
                })

                if (!questionexists) {
                    displaylist.push(q);

                    this.GetChildren(data, q, childItem => {
                        displaylist.push(childItem);
                    });
                }
            }

            const pageHtml = await this.BuildHtmlPage(displaylist, memberId, assessmentId);

            return pageHtml;

        } catch (e) {
            console.log(e);
        }

    }

}

module.exports = HtmlBuilder;