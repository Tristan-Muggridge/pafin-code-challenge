import { expect } from 'chai';
import { describe } from 'mocha';
import { validateName, validateEmail, validatePassword } from '../../src/controllers/user';        

describe('ValidateName', () => {

    it('Stephen is a valid name', () => {
        const result = validateName('Stephen');
        expect(result).to.deep.equal({
            provided: true,
            length: true,
        });
    });

    it('St is not a valid name', () => {
        const result = validateName('St');
        expect(result).to.deep.equal({
            provided: true,
            length: false,
        });
    });

    it('"" is not a valid name', () => {
        const result = validateName('');
        expect(result).to.deep.equal({
            provided: false,
            length: false,
        });
    });

    it('undefined is not a valid name', () => {
        const result = validateName(undefined);
        expect(result).to.deep.equal({
            provided: false,
            length: false,
        });
    });

});

describe('ValidateEmail', () => {
    
    it('test.user@test.com is a valid email', () => {
        const result = validateEmail('test.user@test.com');
        expect(result).to.deep.equal({
            provided: true,
            valid: true,
        });
    });

    it('test.user@test is not a valid email', () => {
        const result = validateEmail('test.user@test');
        expect(result).to.deep.equal({
            provided: true,
            valid: false,
        });
    });

    it('"" is not a valid email', () => {
        const result = validateEmail('');
        expect(result).to.deep.equal({
            provided: false,
            valid: false,
        });
    });

    it('undefined is not a valid email', () => {
        const result = validateEmail(undefined);
        expect(result).to.deep.equal({
            provided: false,
            valid: false,
        });
    });

});

describe('ValidatePassword', () => {

    it('Password1! is a valid password', () => {
        const result = validatePassword('Password1!');
        expect(result).to.deep.equal({
            provided: true,
            length: true,
            numbers: true,
            specials: true,
        });
    });

    it('Password1 is not a valid password - no specials', () => {
        const result = validatePassword('Password1');
        expect(result).to.deep.equal({
            provided: true,
            length: true,
            numbers: true,
            specials: false,
        });
    });

    it('Password! is not a valid password - no numbers', () => {
        const result = validatePassword('Password!');
        expect(result).to.deep.equal({
            provided: true,
            length: true,
            numbers: false,
            specials: true,
        });
    });

    it('Password is not a valid password - no num & no specials', () => {
        const result = validatePassword('Password');
        expect(result).to.deep.equal({
            provided: true,
            length: true,
            numbers: false,
            specials: false,
        });
    });

    it('test is not a valid password - too short, no num, no specials', () => {
        const result = validatePassword('Password');
        expect(result).to.deep.equal({
            provided: true,
            length: true,
            numbers: false,
            specials: false,
        });
    });

    it('"" is not a valid password - blank', () => {
        const result = validatePassword('');
        expect(result).to.deep.equal({
            provided: false,
            length: false,
            numbers: false,
            specials: false,
        });
    });

    it('undefined is not a valid password - undefined', () => {
        const result = validatePassword(undefined);
        expect(result).to.deep.equal({
            provided: false,
            length: false,
            numbers: false,
            specials: false,
        });
    });

});