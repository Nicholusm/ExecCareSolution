const sql = require('mssql');

const config = {

    sql: function () {
        return "mssql://sa:1964587912Amo@localhost/HealthManagement";
    }
};

const pool = sql.connect(config.sql(), function (err) {
    if (err)
        throw err;
});

function SqlRunner() {

    this.GetSectionsForMemberByMemberId = async (memberId) => {

        let result2 = await pool.request()
            .input('memberid', sql.Int, memberId)
            .execute('GetQuestionaireMemberSections');

        let data = await result2;

        return data;
    }

    this.GetSectionById = async (sectionId) => {

        let result2 = await pool.request()
            .input('SectionId', sql.NVarChar, sectionId)
            .execute('ec2_GetSectionData');

        let data = await result2;

        return data;
    }

    this.GetOptionByQuestionId = async (questionId) => {

        let result2 = await pool.request()
            .input('QuestionId', sql.Int, questionId)
            .execute('ec2_GetOptionIdByQuestionId');

        let data = await result2;

        return data;
    };

    this.GetProfileAlphanumericValues = async (memberid, optionId) => {

        let result2 = await pool.request()
            .input('memberId', sql.NVarChar, memberid)
            .input('optionId', sql.NVarChar, optionId)
            .execute('ec2_GetProfileAlphanumericValues');

        let data = await result2;

        return data;
    }

    this.GetCharacterAnswered = async (memberid, assessmentid, questionid) => {

        let result2 = await pool.request()
            .input('memberId', sql.NVarChar, memberid)
            .input('assId', sql.Int, assessmentid)
            .input('QuestionId', sql.Int, questionid)
            .execute('ec2_GetCharacterAnswered');

        let data = await result2;

        return data;
    }
    this.GetLookupAnswerByOptionId = async (optionId, memberid) => {
        let result2 = await pool.request()

            .input('optionId', sql.NVarChar, optionId)
            .input('memberId', sql.NVarChar, memberid)
            .execute('ec2_GetLookupAnswerByOptionId');

        let data = await result2;

        return data;
    }
    this.GetAnswerByQuestionId = async (questionId, memberid) => {
        let result2 = await pool.request()

            .input('questionId', sql.NVarChar, questionId)
            .input('memberId', sql.Int, memberid)
            .execute('ec2_GetAnswerByQuestionId');

        let data = await result2;

        return data;
    }
    this.GetNumericAnswered = async (assessmentid, questionId) => {
        let result2 = await pool.request()
            .input('assementID', sql.Int, assessmentid)
            .input('questionId', sql.NVarChar, questionId)
            .execute('ec2_GetNumericAnswered');

        let data = await result2;

        return data;

    }

    this.GetCheckedBox = async (assessmentid, questionId) => {
        let result2 = await pool.request()
            .input('assesmentId', sql.NVarChar, assessmentid)
            .input('questionId', sql.NVarChar, questionId)
            .execute('ec2_GetNumericAnswered_checkbox');

        let data = await result2;

        return data;

    }


    this.SaveLookExecToProfiler = async (memberid, optionId, answervalue, valueid) => {

        let result2 = await pool.request()

            .input('memberID', sql.Int, memberid)
            .input('optionID', sql.Int, optionId)
            .input('optionValues', sql.NVarChar, answervalue)
            .input('ClientValueIDs', sql.NVarChar, valueid)
            .execute('ec2_SubmitMemberLookupRecords');

        let data = await result2;

        return data;

    }

    this.DeleteLookupValues = async (memberid, assessmentid, questionid) => {

        let result2 = await pool.request()
            .input('memberID', sql.Int, memberid)
            .input('assesmentID', sql.Int, assessmentid)
            .input('questionID', sql.Int, questionid)
            .execute('ec2_DeleteLookupValues');

        let data = await result2;

        return data;
    }
    this.DeleteCharacterValues = async (memberid, assessmentid, questionid) => {

        let result2 = await pool.request()
            .input('memberID', sql.Int, memberid)
            .input('assesmentID', sql.Int, assessmentid)
            .input('questionID', sql.Int, questionid)
            .execute('ec2_DeleteCharacterValues');

        let data = await result2;

        return data;
    }



    this.InsertExecCareInsertLookupValues = async (memberid, questionid, answerid, assesmentId) => {

        let result2 = await pool.request()
            .input('MemberID', sql.Int, memberid)
            .input('QuestionID', sql.Int, questionid)
            .input('AnswerID', sql.Int, answerid)
            .input('AssID', sql.Int, assesmentId)

            .execute('ec2_ExecCareInsertLookupValues');

        let data = await result2;

        return data;


    }



    this.GetAlphanumericValueEntryID = async (memberid, optionid) => {
        let result2 = await pool.request()
            .input('MemberID', sql.Int, memberid)
            .input('optionid', sql.NVarChar, optionid)

            .execute('ec2_GetAlphanumericValueEntryID');

        let data = await result2;

        return data;
    }

    this.InsertExecCareCharacterValues = async (memberid, questionid, value, assessmentid) => {

        let result2 = await pool.request()
            .input('MemberID', sql.Int, memberid)
            .input('QuestionID', sql.Int, questionid)
            .input('Answer', sql.NVarChar, value)
            .input('AssID', sql.Int, assessmentid)

            .execute('ec2_ExecCareInsertCharacterValues');

        let data = await result2;

        return data;


    }
    this.SubmitMemberAlphanumericRecord = async (entryid, memberid, optionid, optionValue, clientOptionID) => {

        console.log(entryid);
        console.log(memberid);

        let result2 = await pool.request()

            .input('entryID', sql.Int, entryid)
            .input('memberID', sql.Int, memberid)
            .input('optionID', sql.NVarChar, optionid)
            .input('optionValue', sql.NVarChar, optionValue)
            .input('clientOptionID', sql.NVarChar, clientOptionID)

            .execute('__SubmitMemberAlphanumericRecord');

        let data = await result2;

        return data;



    }


    this.DeleteHtmlValues = async (memberid, questionid) => {

        let result2 = await pool.request()

            .input('MemberID', sql.Int, memberid)
            .input('questionID', sql.Int, questionid)

            .execute('ec2_DeleteHtmlValues');

        let data = await result2;

        return data;

    }



    this.GetNumericValueEntryID = async (memberid, optionid) => {
        let result2 = await pool.request()
            .input('MemberID', sql.Int, memberid)
            .input('optionid', sql.Int, optionid)

            .execute('ec2_GetNumericValueEntryID');

        let data = await result2;

        return data;

    }


    this.SubmitMemberNumericRecord = async (entryid, memberid, optionid, optionValue, clientOptionID) => {

        let result2 = await pool.request()

            .input('entryID', sql.NVarChar, entryid)
            .input('memberID', sql.Int, memberid)
            .input('optionID', sql.NVarChar, optionid)
            .input('optionValue', sql.NVarChar, optionValue)
            .input('clientOptionID', sql.NVarChar, clientOptionID)

            .execute('__SubmitMemberNumericRecord');

        let data = await result2;

        return data;



    }

    this.DeleteNumericValues = async (memberid, assessmentid, questionid) => {

        let result2 = await pool.request()

            .input('MemberID', sql.Int, memberid)
            .input('assid', sql.Int, assessmentid)
            .input('questionID', sql.NVarChar, questionid)

            .execute('ec2_DeleteNumericValue');

        let data = await result2;

        return data;

    }
    this.InsertNumericValues = async (memberid, questionid, answervalue, assesmentId) => {

        let result2 = await pool.request()

            .input('MemberID', sql.Int, memberid)
            .input('QuestionID', sql.Int, questionid)
            .input('AnswerValue', sql.Float, answervalue)
            .input('AssID', sql.Int, assesmentId)


            .execute('ExecCareInsertNumericValues');

        let data = await result2;

        return data;

    }

    this.OTPMemberVerification = async (MemGuid, OTP) => {

        let result2 = await pool.request()

            .input('MemGuid', sql.NVarChar, MemGuid)
            .input('otp', sql.Int, OTP)


            .execute('ec2_OtpVerification');

        let data = await result2;

        return data;


    }
    this.CompletedSections = async (assesmentId) => {
        let result2 = await pool.request()
            .input("assId", sql.Int, assesmentId)

            .execute("ec2_CompletedSections");

        let data = await result2;

        return data;

    }
    //Getiing Clients Phone number
    this.MobileNumber = async (memberid) => {
        let result2 = await pool.request()

            .input("memberid", sql.NVarChar, memberid)
            .execute("GetMobileNumber");

        let data = await results2;

        return data;

    }


    this.GetFieldType = async (questionId) => {
        let result2 = await pool.request()
            .input('Id', sql.NVarChar, questionId)
            .execute('ec3_GetFieldType');
        let data = await result2;

        return data;
    }
}

module.exports = SqlRunner;