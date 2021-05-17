describe('Hacker Stories', () => {
        
context('Hitting the API', () => {
      context('list of stories', () => {
        beforeEach(() => {
          cy.intercept(
            'GET',
          '**search?query=redux&page=0&hitsPerPage=100',
          
          ).as('stories')
  
          cy.visit('/')
  
          cy.wait('@stories')
        })
  
        it('should list 100 rows', () => {
          cy.get('.table-row').should('be.visible').and('have.length', 100)
        })
    })
})
context.only('Mocking the API', () => {
  
  const term = 'cypress'

  context('list of stories', () => {
    beforeEach(() => {
      cy.intercept(
        '**/search?query=redux&page=0&hitsPerPage=100',
        { fixture: 'empty'}
      ).as('empty')
      cy.intercept(
        `**/search?query=${term}&page=0&hitsPerPage=100`,
        { fixture: 'stories'}
      ).as('stories')
  
      cy.visit('/')
      cy.wait('@empty')
    })

    it('should correctly caches the results', () => {
      const faker =require('faker')
      const randomWord = faker.random.word()
      let count =0

      cy.intercept(`**/search?query=${randomWord}**`, req => {
        count +=1
        req.reply({fixture: 'empty'})
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
  })
})
})