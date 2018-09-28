const sql = require('../server/sqlqueries');
const mydata = require('../server/buildhtml');
const Array = require('node-array');
const express = require("express");

const sqlquery = new sql();

function FormStorage() {

    const InsertRadioAnswers = async (formField, memberid, assessmentid, questionid) => {

        let data = await sqlquery.GetOptionByQuestionId(questionid);

        const hasoptionid = data.recordset.length;

        const optionid = hasoptionid > 0 ? data.recordset[0].OptionId : 0;

        if (optionid != 0) {

            let SavememberValues = await sqlquery.SaveLookExecToProfiler(memberid, optionid, formField + ',', null);
        }
        else {

            let deletedata = await sqlquery.DeleteLookupValues(memberid, assessmentid, questionid);

            let insertValues = await sqlquery.InsertExecCareInsertLookupValues(memberid, questionid, parseInt(formField), assessmentid);
        }
    };

    const InsertCheckAnswers = async (formField, memberid, assessmentid, questionid) => {

        let data = await sqlquery.GetOptionByQuestionId(questionid);
        const hasoptionid = data.recordset.length;
        const optionid = hasoptionid > 0 ? data.recordset[0].OptionId : 0;

        if (optionid != 0) {
            let SavememberValues = await sqlquery.SaveLookExecToProfiler(memberid, assessmentid, questionid);
        }
        else {

            let deletedata = await sqlquery.DeleteLookupValues(memberid, assessmentid, questionid);

            if (Array.isArray(formField)) {

                for (const key in formField) {
                    const value = formField[key];
                    let insertValues = await sqlquery.InsertExecCareInsertLookupValues(memberid, questionid, value, assessmentid);
                }

            } else {
                let insertValues = await sqlquery.InsertExecCareInsertLookupValues(memberid, questionid, formField, assessmentid);
            }
        }

        return;
    };

    const InsertTextBoxAnswers = async (formField, memberid, assessmentid, questionId) => {

        let data = await sqlquery.GetOptionByQuestionId(questionId);
        const hasoptionid = data.recordset.length;
        const optionid = hasoptionid > 0 ? data.recordset[0].OptionId : 0;

        if (optionid != 0) {

            if (questionId == 8) {

                try {

                    const dateObject = new Date(formField);
                    let entrySet = await sqlquery.GetAlphanumericValueEntryID(memberid, optionid);

                    let entryRecordSet = entrySet.recordset[0];

                    let submitMemberRecords = await sqlquery.SubmitMemberAlphanumericRecord(entryRecordSet.EntryId, memberid, optionid, formField);

                } catch (ex) {
                    console.log(ex);
                }
            }
            else {

                let entrySet = await sqlquery.GetAlphanumericValueEntryID(memberid, optionid);
                const entryId = entrySet.recordset[0].EntryId;

                let submitMemberRecords = await sqlquery.SubmitMemberAlphanumericRecord(entryId, memberid, optionid, formField);
            }
        }
        else {

            let deletedata = await sqlquery.DeleteCharacterValues(memberid, assessmentid, questionId);
            let insertValues = await sqlquery.InsertExecCareCharacterValues(memberid, questionId, formField, assessmentid);
        }
    };


    const InsertNumericFieldAnswers = async (formField, memberid, assessmentid, questionId) => {


        let data = await sqlquery.GetOptionByQuestionId(questionId);
        const hasoptionid = data.recordset.length;
        const optionid = hasoptionid > 0 ? data.recordset[0].OptionId : 0;
        if (optionid != 0) {

            let entrySet = await sqlquery.GetNumericValueEntryID(memberid, optionid);

            const entryId = entrySet.recordset.length == 0 ? -1 : entrySet.recordset[0].EntryId;

            let submitMemberRecords = await sqlquery.SubmitMemberNumericRecord(entryId, memberid, optionid, formField);
        }
        else {

            let deletedata = await sqlquery.DeleteNumericValues(memberid, assessmentid, questionId);
            let insertValues = await sqlquery.InsertNumericValues(memberid, questionId, parseFloat(formField), assessmentid);
        }
    };

    this.SaveForm = async (categoryid, form, memberid, assessmentid) => {


        for (const questionId in form) {
            const formField = form[questionId];

            let controlData = await sqlquery.GetFieldType(questionId);
            const controlTypeId = controlData.recordset[0].ID;

            switch (controlTypeId) {
                case 1: await InsertRadioAnswers(formField, memberid, assessmentid, questionId);
                    break;
                case 4:
                case 2: await InsertCheckAnswers(formField, memberid, assessmentid, questionId);
                    break;
                case 6:
                case 3: await InsertTextBoxAnswers(formField, memberid, assessmentid, questionId);
                    break;
                case 5: await InsertNumericFieldAnswers(formField, memberid, assessmentid, questionId);
                    break;
            }
        }

    }
}

module.exports = FormStorage;