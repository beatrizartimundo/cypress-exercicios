/// <reference types="cypress" />

describe('Hacker Stories', () => {
  context('Hitting the API', () => {
    context('list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          '**search?query=redux&page=0&hitsPerPage=100'

        ).as('realStories')

        cy.visit('/')

        cy.wait('@realStories')
      })

      it('should list 100 rows', () => {
        cy.get('.table-row').should('be.visible').and('have.length', 100)
      })
    })
  })
  context('Mocking the API', () => {
    const term = 'cypress'
    const stories = require('../fixtures/stories.json')

    context('list stories', () => {
      beforeEach(() => {
        cy.intercept(
          'search?query=redux&page=0&hitsPerPage=100',
          { fixture: 'stories' }
        ).as('reduxStories')

        cy.visit('/')
        cy.wait('@reduxStories')
      })

      it('shows the right data for the stories', () => {
        cy.get('.table-row')
          .first()
          .should('be.visible')
          .should('contain', stories.hits[0].title)
          .and('contain', stories.hits[0].author)
          .and('contain', stories.hits[0].num_comments)
          .and('contain', stories.hits[0].points)

        cy.get('.table-row')
          .last()
          .should('be.visible')
          .should('contain', stories.hits[1].title)
          .and('contain', stories.hits[1].author)
          .and('contain', stories.hits[1].num_comments)
          .and('contain', stories.hits[1].points)
      })
      it('shows one story after dimissing the first one', () => {
        cy.get('.button-inline:contains(Dismiss)')
          .first()
          .should('be.visible')
          .click()

        cy.get('.table').should('have.length', 1)
      })

      context('Order the content', () => {
        it('order by title', () => {
          cy.get('.button-inline:contains(Title)')
            .as('title')
            .should('be.visible')
            .click()

          cy.get('.table')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].title)
          cy.get(`.table a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)
          cy.get('@title').click()
          cy.get('.table')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[1].title)
          cy.get(`.table a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('order by author', () => {
          cy.get('.button-inline:contains(Author)')
            .as('author')
            .should('be.visible')
            .click()

          cy.get('.table')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].author)

          cy.get('@author').click()

          cy.get('.table')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[1].author)
        })

        it('order by points', () => {
          cy.get('.button-inline:contains(Points)')
            .as('point')
            .should('be.visible')
            .click()

          cy.get('.table')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].points)

          cy.get('@point').click()

          cy.get('.table')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[1].points)
        })
      })
    })
    context('search stories', () => {
      beforeEach(() => {
        cy.intercept(
          '**/search?query=redux&page=0&hitsPerPage=100',
          { fixture: 'empty' }
        ).as('empty')
        cy.intercept(
        `**/search?query=${term}&page=0&hitsPerPage=100`,
        { fixture: 'stories' }
        ).as('stories')

        cy.visit('/')
        cy.wait('@empty')
      })

      it('should correctly caches the results', () => {
        const faker = require('faker')
        const randomWord = faker.random.word()
        let count = 0

        cy.intercept(`**/search?query=${randomWord}**`, req => {
          count += 1
          req.reply({ fixture: 'empty' })
        }).as('random')

        cy.search(randomWord).then(() => {
          expect(count, `network calls to fetch ${randomWord}`).to.equal(1)

          cy.wait('@random')

          cy.search(term)
          cy.wait('@stories')

          cy.search(randomWord).then(() => {
            expect(count, `network calls to fetch ${randomWord}`).to.equal(1)
          })
        })
      })

      it('shows no story when none is returned', () => {
        cy.get('.table-row').should('not.exist')
      })

      it('types and hits ENTER', () => {
        cy.get('input[type="text"]')
          .should('be.visible')
          .clear()
          .type(`${term}{enter}`)

        cy.wait('@stories')

        cy.get('.table-row')
          .should('be.visible')
          .and('have.length', 2)

        cy.get('input[type="text"]')
          .should('be.visible')
          .and('have.value', term)
      })

      it('types and clicks the submit button', () => {
        cy.get('input[type="text')
          .should('be.visible')
          .clear()
          .type(term)
        cy.get('button:contains(Search)')
          .should('be.visible')
          .click()

        cy.wait('@stories')

        cy.get('.table-row')
          .should('be.visible')
          .and('have.length', 2)

        cy.get('input[type="text"]')
          .should('be.visible')
          .and('have.value', term)
      })
    })
  })
})
context('Errors', () => {
  it('shows error in case of server error', () => {
    cy.intercept(
      '**/search**',
      { statusCode: 500 }
    ).as('serverFailure')

    cy.visit('/')
    cy.wait('@serverFailure')

    cy.get('p:contains(Something went wrong.)')
      .should('be.visible')
  })
  it('shows error in case of network error', () => {
    cy.intercept(
      '**/search**',
      { forceNetworkError: true }
    ).as('networkFailure')

    cy.visit('/')
    cy.wait('@networkFailure')

    cy.get('p:contains(Something went wrong.)')
      .should('be.visible')
  })
})

it('shows loading', () => {
  cy.intercept(
    '**/search**',
    {
      delay: 2000,
      fixture: 'stories'
    }
  ).as('delayStories')

  cy.visit('/')
  cy.contains('Loading ...').should('be.visible')
  cy.wait('@delayStories')

  cy.get('.table-row')
    .should('be.visible')
    .and('have.length', 2)
})
