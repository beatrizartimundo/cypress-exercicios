/// <reference types="cypress" />

import 'cypress-localstorage-commands'

Cypress.Commands.add('search', term => {
  cy.get('input[type="text"]')
    .should('be.visible')
    .clear()
    .type(`${term}{enter}`)
})
