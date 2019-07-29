import {expect} from "chai";
import "mocha";

import Log from "../../../common/Log";
import {GradesController} from "../src/controllers/GradesController";
import {CSVParser} from "../src/server/common/CSVParser";

import "./GlobalSpec";
import {Test} from './TestHarness';

describe('CSVParser', function() {

    before(async () => {
        await Test.suiteBefore("CSVParser");
        await Test.prepareAll();
    });

    it('Should be able to process an empty classlist', async function() {
        const path = __dirname + '/data/classlistEmpty.csv';
        const csv = new CSVParser();
        const rows = await csv.processClasslist(Test.ADMIN1.id, path);
        Log.test('# rows processed: ' + rows.length);
        expect(rows).to.have.lengthOf(0);
    });

    it('Should be able to process a vaild classlist', async function() {
        const path = __dirname + '/data/classlistValid.csv';
        const csv = new CSVParser();
        const rows = await csv.processClasslist(Test.ADMIN1.id, path);
        Log.test('# rows processed: ' + rows.length);
        expect(rows).to.have.lengthOf(5);
    });

    it('Should reject a classlist with empty field in fields: CWL, ACCT', async function() {
        const path = __dirname + '/data/classlistEmptyField.csv';
        const csv = new CSVParser();
        let ex = null;
        try {
            await csv.processClasslist(Test.ADMIN1.id, path);
        } catch (err) {
            ex = err;
        }
        expect(ex).to.not.be.null;
    });

    it('Should reject a classlist with duplicate data in fields: CWL, ACCT', async function() {
        const path = __dirname + '/data/classlistDuplicateField.csv';
        const csv = new CSVParser();
        let ex = null;
        try {
            await csv.processClasslist(Test.ADMIN1.id, path);
        } catch (err) {
            ex = err;
        }
        expect(ex).to.not.be.null;
    });

    it('Should be able to process an updated classlist', async function() {
        const path = __dirname + '/data/classlistValidUpdate.csv';
        const csv = new CSVParser();
        const rows = await csv.processClasslist(Test.ADMIN1.id, path);
        Log.test('# rows processed: ' + rows.length);
        expect(rows).to.have.lengthOf(5);
    });

    it('Should not be able to process an invalid classlist', async function() {
        let rows = null;
        let ex = null;
        try {
            const path = __dirname + '/data/classlistInvalid.csv';
            const csv = new CSVParser();
            rows = await csv.processClasslist(Test.ADMIN1.id, path);
        } catch (err) {
            ex = err;
        }
        expect(rows).to.be.null;
        expect(ex).to.not.be.null;
    });

    it('Should be able to process an empty grade sheet', async function() {
        const path = __dirname + '/data/gradesEmpty.csv';
        const csv = new CSVParser();
        const rows = await csv.processGrades(Test.ADMIN1.id, Test.DELIVID0, path);
        Log.test('# rows processed: ' + rows.length);
        expect(rows).to.have.lengthOf(0);
    });

    it('Should be able to process a valid grade sheet', async function() {
        // check pre
        const gc = new GradesController();
        let grade = await gc.getGrade(Test.USER1.id, Test.DELIVID1);
        expect(grade.score).to.equal(100);
        grade = await gc.getGrade(Test.USER2.id, Test.DELIVID1);
        expect(grade.score).to.equal(100);
        grade = await gc.getGrade(Test.USER3.id, Test.DELIVID1);
        expect(grade).to.be.null;

        // do upload
        const path = __dirname + '/data/gradesValid.csv';
        const csv = new CSVParser();
        const rows = await csv.processGrades(Test.ADMIN1.id, Test.DELIVID1, path);
        Log.test('# rows processed: ' + rows.length);
        expect(rows).to.have.lengthOf(3);

        // validate outcome
        grade = await gc.getGrade(Test.USER1.id, Test.DELIVID1);
        expect(grade.score).to.equal(92);
        grade = await gc.getGrade(Test.USER2.id, Test.DELIVID1);
        expect(grade.score).to.equal(29);
        grade = await gc.getGrade(Test.USER3.id, Test.DELIVID1);
        expect(grade.score).to.equal(19);
    });

    it('Should not be able to process grades for an invalid deliverable', async function() {
        let rows = null;
        let ex = null;
        try {
            const path = __dirname + '/data/gradesValid.csv';
            const csv = new CSVParser();
            rows = await csv.processGrades(Test.ADMIN1.id, 'invalidDeliverableId', path);
        } catch (err) {
            ex = err;
        }
        expect(rows).to.be.null;
        expect(ex).to.not.be.null;
    });

    it('Should not be able to process an invalid grade sheet', async function() {
        let rows = null;
        let ex = null;
        try {
            const path = __dirname + '/data/gradesInvalid.csv';
            const csv = new CSVParser();
            rows = await csv.processGrades(Test.ADMIN1.id, Test.DELIVID1, path);
        } catch (err) {
            ex = err;
        }
        expect(rows).to.be.null;
        expect(ex).to.not.be.null;
    });
});
