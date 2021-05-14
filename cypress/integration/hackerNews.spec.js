describe('Hacker Stories', () => {
      
    context('Mocking the API', () => {
      context('list of stories', () => {
        beforeEach(() => {
          cy.intercept(
            'GET',
          '**search?query=redux&page=0&hitsPerPage=100',
          
          ).as('getStories')
  
          cy.visit('/')
  
          cy.wait('@getStories')
        })
  
        it('shows the footer', () => {
          
        })
    })
})
})