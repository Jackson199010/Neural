JBase.namespace('ErrorCalculation');
JBase.ErrorCalculation = (function () {
		var ctor = function () {
			this.global_error = 0;
			this.set_size = 0;
		};

		ctor.prototype =  {
			//// Returns RMS
			calculateRMS: function () {  
				return Math.sqrt(this.global_error / this.set_size) 
			},
			/// Updates Error between actual and ideal outputs
			// actual - array, ideal - array
			updateError: function (actual, ideal) {
				var delta_sqr = 0;
				this.set_size += ideal.length;

				for (var i = 0; i < ideal.length; i++) {
					delta_sqr = Math.pow(ideal[i] - actual[i], 2);
					this.global_error += delta_sqr;
				}
			},
			/// Reset values
			reset: function () {
				this.global_error = 0;
				this.set_size = 0;
			}
		};
		return ctor;
})();
JBase.ErrorCalculation.descr = "Class for calculating RMS Error.";