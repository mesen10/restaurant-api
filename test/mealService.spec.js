const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { ForbiddenError, UnauthorizedError } = require('../src/util/errors');
const config = require('../src/config/config');
const logger = require('../src/util/logger');
const Meal = require('../src/model/dao/mealModel');
const Restaurant = require('../src/model/dao/restaurantModel');

const mealService = require('../src/service/mealService');
const expect = chai.expect;

const privateUserToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIxIiwidXNlclR5cGUiOiJwcml2YXRlIiwiaWF0IjoxNTg3ODM1ODAzfQ.e6klHcIHcY1MhztaPHPDYEx4fdDy5O-uBiQht00Ml74';

describe('Meal Service', () => {
  describe('getMeals', () => {
    context('basic flow', () => {
      it('should call get all meals for that restaurant', async () => {
        const meals = [
          {
            _id: '5ea46ab270e3536ff838b872',
            name: 'Lamb Doner',
            description: 'Lamb',
            price: 8,
            owner: 'Rest1',
            restaurantId: '5ea46a7170e3536ff838b870',
            createdAt: '2020-04-25T16:52:02.454+00:00',
          },
          {
            _id: '5ea46abf70e3536ff838b873',
            name: 'Chicken Doner',
            description: 'Chicken',
            price: 7,
            owner: 'Rest1',
            restaurantId: '5ea46a7170e3536ff838b870',
            createdAt: '2020-04-25T16:52:15.502+00:00',
          },
        ];

        const findResult = {
          exec: sinon.stub().resolves(meals),
        };

        const mealStub = sinon.stub(Meal, 'find');
        mealStub.returns(findResult);

        const mealResponse = await mealService.getMeals(
          privateUserToken,
          '5ea46a7170e3536ff838b870'
        );

        // This is a simple service method just basically check fields
        expect(mealResponse).to.be.not.empty;
        expect(mealResponse.length).to.equal(2);
        expect(mealResponse[0].name).to.equal('Lamb Doner');
        expect(mealResponse[1].name).to.equal('Chicken Doner');
      });
    });
  });
});
