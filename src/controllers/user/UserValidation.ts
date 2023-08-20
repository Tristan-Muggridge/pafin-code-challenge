import { UserCreate } from "../../database/db"

type rule = {
    valid: boolean
    message: string
}

type ValidationSummary = {
    valid: boolean
    messages: string[]
}

const minNameLength = 3;
const minPasswordLength = 8;
const minPasswordNumber = 1;
const minPasswordSpecial = 1;

class UserValidation {
    name: ValidationSummary;
    email: ValidationSummary;
    password: ValidationSummary;

    constructor(name: string | undefined, email: string | undefined, password: string | undefined) {
        this.name = this.validateName(name??"");
        this.email = this.validateEmail(email??"");
        this.password = this.validatePassword(password??"");

        removeEmptyMessageKeys(this.name);
        removeEmptyMessageKeys(this.email);
        removeEmptyMessageKeys(this.password);
    }

    private validateName = (name: string) => {
        name = name.trim();

        const rules = [
            {
                valid: !!name,
                message: "Name is required."
            },
            {
                valid: name?.length > minNameLength,
                message: `Name must be at least ${minNameLength} characters long.`
            }
        ]
    
        return generateValidationSummary(rules);
    }

    private validateEmail = (email: string):ValidationSummary => {
        const rules = [
            // Check for email
            {
                valid: !!email,
                message: "Email is required."
            },
            // Check for @ symbol
            {
                valid: email?.includes("@"),
                message: "Email must contain an @ symbol."
            },
            // Check for domain after @ symbol
            {
                valid: !!email?.split("@")[1],
                message: "Email must contain a domain. (e.g. @gmail.com)"
            }
        ]
    
        return generateValidationSummary(rules);
    }

    private validatePassword = (password: string) => {
        const rules = [
            {
                valid: !!password,
                message: "Password is required."
            },
            {
                valid: password?.length >= minPasswordLength,
                message: `Password must be at least ${minPasswordLength} characters long.`
            },
            {
                valid: (password?.match(/\d+/g)?.length ?? 0) >= minPasswordNumber,
                message: `Password must contain at least ${minPasswordNumber} number.`
            },
            {
                valid: (password?.match(/[!@#$%^&*(),.?":{}|<>]/g)?.length ?? 0) >= minPasswordSpecial,
                message: `Password must contain at least ${minPasswordSpecial} special character.`
            }
        ]
    
        return generateValidationSummary(rules);
    }

    public get valid() {
        return this.name.valid && this.email.valid && this.password.valid;
    }
}

const generateValidationSummary = (rules: rule[]) => rules.reduce( (acc, rule) => {
    if (!rule.valid) {
        acc.valid = false;
        acc.messages.push(rule.message);
    }
    return acc;
}, {valid: true, messages: []} as ValidationSummary);

const removeEmptyMessageKeys = (errors: ValidationSummary) => {
    for (const key in errors) {
        let typedKey = key as keyof typeof errors;
        let value = errors[typedKey];
        if (Array.isArray(value) && value.length === 0) delete errors[key as keyof typeof errors];
    }
}

export default (user: UserCreate) => new UserValidation(user.name, user.email, user.password);