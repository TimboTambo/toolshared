import faker from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      postcode: `${faker.random.alpha({
        count: 2,
        upcase: true,
      })}${faker.random.numeric(2)} ${faker.random.numeric(
        1
      )}${faker.random.alpha({ count: 2, upcase: true })}`,
    };
    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visit("/");
    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);

    cy.findByLabelText(/First name/i).type(loginForm.firstName);
    cy.findByLabelText(/Last name/i).type(loginForm.lastName);
    cy.findByLabelText(/Postcode/i).type(loginForm.postcode);

    cy.findByRole("button", { name: /create account/i }).click();

    cy.findByText("Log out").click();
    cy.findByRole("link", { name: /log in/i });
  });
});
