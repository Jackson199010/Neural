/*
/// using Hopfield NN
hopf = new JBase.Neural.Hopfield(7);
hopf.train([1, 0, 0, 0, 1, 1, 0]);
res = hopf.present([1, 0, 0, 0, 1, 1, 1]);
console.log(res);
*/

var error = new JBase.ErrorCalculation();

error.updateError([3,4,5], [1,2,3]);
console.log(error.calculateRMS());



