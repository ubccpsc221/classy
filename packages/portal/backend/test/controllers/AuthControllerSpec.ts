import {expect} from "chai";
import "mocha";

import {AuthController} from "../../src/controllers/AuthController";
import {DatabaseController} from "../../src/controllers/DatabaseController";
import {PersonController} from "../../src/controllers/PersonController";
import {Auth, Person} from "../../src/Types";

import '../GlobalSpec';
import './PersonControllerSpec';

describe("AuthController", () => {

    const TIMEOUT = 5000;

    let ac: AuthController;

    beforeEach(() => {
        ac = new AuthController();
    });

    it("Should not validate a user who does not exist.", async () => {
        const isValid = await ac.isValid('aUserwhoDoesNotExist_sadmewnmdsv', ''); // not registered
        expect(isValid).to.be.false;
    });

    it("Should not let a person who does not exist be privileged.", async () => {
        const isPriv = await ac.isPrivileged('aUserwhoDoesNotExist_sadmewnmdsvKKDSS', ''); // not registered
        expect(isPriv.isAdmin).to.be.false;
        expect(isPriv.isStaff).to.be.false;
    });

    it("Should identify a staff correctly.", async function() {
        const pc = new PersonController();
        const p: Person = {
            id:            'rtholmes',
            csId:          'r2d2',
            githubId:      'rtholmes',
            studentNumber: null,

            fName: '',
            lName: '',
            kind:  '',
            URL:   null,

            labId: null,

            custom: {}
        };
        const newPerson = await pc.createPerson(p);
        expect(newPerson).to.not.be.null;

        let isValid = await ac.isValid('rtholmes', 'faketoken');
        expect(isValid).to.be.false;

        const auth: Auth = {
            personId: 'rtholmes',
            token:    'realtoken'
        };
        await DatabaseController.getInstance().writeAuth(auth);
        isValid = await ac.isValid('rtholmes', 'realtoken');
        expect(isValid).to.be.true;

        const isPriv = await ac.isPrivileged('rtholmes', 'realtoken');
        expect(isPriv.isAdmin).to.be.true;
        expect(isPriv.isStaff).to.be.true;
    }).timeout(TIMEOUT);

    it("Should identify a non-admin correctly.", async function() {
        const pc = new PersonController();
        const p: Person = {
            id:            'user',
            csId:          'r2d2',
            githubId:      'user',
            studentNumber: null,

            fName: '',
            lName: '',
            kind:  '',
            URL:   null,

            labId: null,

            custom: {}
        };
        const newPerson = await pc.createPerson(p);
        expect(newPerson).to.not.be.null;

        let isValid = await ac.isValid('user', 'faketoken');
        expect(isValid).to.be.false;

        const auth: Auth = {
            personId: 'user',
            token:    'realtoken'
        };
        await DatabaseController.getInstance().writeAuth(auth);
        isValid = await ac.isValid('user', 'realtoken');
        expect(isValid).to.be.true;

        const isPriv = await ac.isPrivileged('user', 'realtoken');
        expect(isPriv.isAdmin).to.be.false;
        expect(isPriv.isStaff).to.be.false;
    }).timeout(TIMEOUT);

    it("Should be able to logout a real user.", async () => {
        const personId = 'rtholmes';
        const dc = DatabaseController.getInstance();
        const pc = new PersonController();

        await dc.getAuth(personId);
        let person = await pc.getPerson(personId);
        expect(person.kind).to.not.be.null;

        const workedEnough = await ac.removeAuthentication(personId);
        expect(workedEnough).to.be.true;

        const auth = await dc.getAuth('rtholmes');
        expect(auth).to.be.null; // shouldn't exist for a logged out person

        person = await pc.getPerson(personId);
        expect(person.kind).to.be.null; // should be null after being logged out
    });

    it("Should be able to handle trying to logout users who do not exist.", async () => {
        // this seems strange, but really we just want it to not crash
        let workedEnough = await ac.removeAuthentication(undefined);
        expect(workedEnough).to.be.false;

        workedEnough = await ac.removeAuthentication(null);
        expect(workedEnough).to.be.false;

        workedEnough = await ac.removeAuthentication('totallyMADEUPname12388291900d');
        expect(workedEnough).to.be.false; // can't
    });

    // TODO: implement auth controller tests
    /*
    let rc: RepositoryController;
    let tc: TeamController;
    let pc: PersonController;

    before(async () => {
    });

    beforeEach(() => {
        tc = new TeamController();
        rc = new RepositoryController();
        pc = new PersonController();
    });

    it("Should be able to get all repositories, even if there are none.", async () => {
        let repos = await rc.getAllRepos(Test.ORGNAME);
        expect(repos).to.have.lengthOf(0);
    });

    it("Should be able to create a repo.", async () => {
        let repos = await rc.getAllRepos(Test.ORGNAME);
        expect(repos).to.have.lengthOf(0);

        let team = await tc.getTeam(Test.ORGNAME, Test.TEAMNAME1);
        expect(team).to.not.be.null;

        let repo = await rc.createRepository(Test.ORGNAME, Test.REPONAME1, [team], {});
        expect(repo).to.not.be.null;

        repos = await rc.getAllRepos(Test.ORGNAME);
        expect(repos).to.have.lengthOf(1);
    });

    it("Should not create a repo a second time.", async () => {
        let repos = await rc.getAllRepos(Test.ORGNAME);
        expect(repos).to.have.lengthOf(1);

        let team = await tc.getTeam(Test.ORGNAME, Test.TEAMNAME1);
        expect(team).to.not.be.null;

        let repo = await rc.createRepository(Test.ORGNAME, Test.REPONAME1, [team], {});
        expect(repo).to.not.be.null;

        repos = await rc.getAllRepos(Test.ORGNAME);
        expect(repos).to.have.lengthOf(1);
    });

    it("Should be able to find all repos for a user.", async () => {
        let repos = await rc.getAllRepos(Test.ORGNAME);
        expect(repos).to.have.lengthOf(1);

        const person = await pc.getPerson(Test.ORGNAME, Test.USERNAME1);
        repos = await rc.getReposForPerson(person);
        expect(repos).to.have.lengthOf(1);
    });
    */
});
