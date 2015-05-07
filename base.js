JBase = {
	descr :"Пространство имен для Для базовых классов",
    namespace: function (namesp) {
        var parent = JBase,
            parts = namesp.split(".");
        if (parts[0] === "JBase") {
            parts = parts.slice(1);
        }
        for (var i = 0; i < parts.length; i++) {
            if (typeof(parent[parts[i]]) === "undefined") {
                parent[parts[i]] = {};
            }
            parent = parent[parts[i]];
        }
        return parent;
    }
};

JBase.namespace("ArrayExplicted");
JBase.namespace("BipolarOps");
JBase.namespace("Matrix");
JBase.namespace("MatrixMath");

//#############################################################################################################################################
//Класс для массива с возможностью задавать размерность массива
// seize_arr - массив размерностей, type - тип (int - по умолчанию), def - значение по-умолчанию
JBase.ArrayExplicted = function (seize_arr, type, def) {
	var type = type, 
		def = def || null,
		arr = [],
		last_val,
		dim = 0,
		dim_len = 0,
		cur_val;
	
	if ( !(this instanceof JBase.ArrayExplicted)) {
		return new JBase.ArrayExplicted(seize_arr, type, def);
	}	
	
	this.array = []; //массив
	this.seize_arr = seize_arr; // массив измерений
		
	switch (type) {
		case "string":
			def = def == null ? "" : def + "";
		break;
		
		case "float":
		case "double":
			def = parseFloat(def == null ? 0: def, 10);
		break;
		
		case "bool":
		case "boolean":
			def = def == null ? false : def == true;
		break;
		
		default:
		case "int":
			type = "int";
			def = parseInt(def == null ? 0 : def, 10);
		break;
	}
	
	// создаем массив заданной размерности
	if (!Array.isArray(this.seize_arr) || this.seize_arr.length === 0) {
		throw Error("Некоректные данные размерности массива");
	}
	
	// последняя ячейка - массив элементов
	last_val = def;
	for (dim = this.seize_arr.length; dim --; ) {
		dim_len = this.seize_arr[dim];
		cur_val = [];
		for (var i = 0; i < dim_len; i++) {
			cur_val.push(last_val);
		}
		last_val = cur_val;
	}
	last_val = JSON.parse(JSON.stringify(last_val));
	
	this.array = last_val;
}
JBase.ArrayExplicted.descr = "Класс для массива с возможностью задавать размерность массива";
// длинаа массива по выбранному измерению
JBase.ArrayExplicted.prototype.getLength = function (dimension) {
	dimension = parseInt(dimension, 10);
	var dim_position = dimension - 1;
	if ( dim_position < 0 || this.seize_arr.length < dimension) {
		return -1;
	}
	return  this.seize_arr[dim_position];
}
// кол-во измерений
JBase.ArrayExplicted.prototype.getDimensions = function () {
	return this.seize_arr.length;
}
//#############################################################################################################################################

// Операции для перевода целых значений в биполярные и обратно, а так же для операций над биполярными значениями
JBase.BipolarOps = {
	descr: "Операции для перевода целых значений в биполярные и обратно, а так же для операций над биполярными значениями",
	toFloat: 0,
	toBoolean: 1,
    toBinary: 2,
	convertBipolar: function (inp, format) { // переводит значения из формата true, false (1, 0) в 1 и -1, для format = 0 и наоборот для format = 1; принимает 1 или 2 мерный массив или число, принимает как массив так и числа
		var res,
			recursive,
			convert,
			format = format || this.toFloat;
		
		if (format == this.toFloat) {
			convert = function (inp) { // конвернтация в чисельный вид
				if (inp) {
					return 1;
				} else {
					return -1;
				}
			}	
		} else if (format == this.toBoolean) {
			convert = function (inp) { // конвернтация в булеановский вид
				inp = parseInt(inp, 10);
				if (inp == 1) {
					return true;
				} else {
					return false;
				}
			}	
		} else if (format == this.toBinary) {
            convert = function (inp) { // конвернтация в чисельный вид
                if (inp) {
                    return 1;
                } else {
                    return 0;
                }
            }
        } else {
			throw Error("Не корректный параметр 'Формат'");
		}

		if (Array.isArray(inp)) { // на входе массив
			res = JSON.parse(JSON.stringify(inp)); // копируем массив
			recursive = function (arr) { // рекурсивный обход массива
				for (var i in arr) {
					if (Array.isArray(arr[i])) {
						recursive(arr[i])
					} else {
						arr[i] = convert(arr[i]);
					}
				}
			}
			recursive(res);	
		} else if (!isNaN(inp)) { // на входе скалярное значение
			res = convert(inp);
		} else {
			throw Error("Не корректный формат входящих данных");
		}
		return res;
	}
};

//#############################################################################################################################################
// варианты создания: указывая размерность; указывая первым параметром двумерный массив
JBase.Matrix = function (rows_or_inp, cols) {
	this.descr = "Операции с матрицами";
	var inner_arr_expl;
	
	if (cols !== undefined) {
		if (rows_or_inp <= 0 || cols <= 0) {
			throw Error("Некоректные входные данные в конструкторе");
		}
		inner_arr_expl = new JBase.ArrayExplicted([rows_or_inp, cols], "float");
		this.matrix = inner_arr_expl.array;
		this.Cols = cols;
		this.Rows = rows_or_inp;
	} else if (rows_or_inp instanceof JBase.Matrix) { // на основании другой матрицы
        return new JBase.Matrix(rows_or_inp.matrix);
    } else { // считаем что массив
		if (JBase.Matrix.checkArray(rows_or_inp)) {
            this.matrix = JSON.parse(JSON.stringify(rows_or_inp));
            this.Rows = this.matrix.length;
            this.Cols = this.matrix[0].length;
        } else {
            throw Error('Невозможно создать матрицу');
        }
	}
    this.Size = this.Cols * this.Rows;
}



// Проверка колонок и строк на корректность границ
JBase.Matrix.prototype.validateBeforeGet = function (row, col) {
	if ((row >= this.Rows) || (row < 0)) {
		throw new Error("Строка " + (row+1) + " вне границ матрици");
	}
	if ((col >= this.Cols) || (col < 0)) {
		throw new Error("Колонка " + (col+1) + " вне границ матрици");
	}
	return true;				
}

// Заполнить матрицу случайными значениями
JBase.Matrix.prototype.randomize = function (min, max) {
	min = parseFloat(min);
	max = parseFloat(max);
	
	if (min > max) {
		throw Error ("min не может быть больше чем max");
	}
	
	for (var r = this.Rows; r--; ) {
		for (var c = this.Cols; c--; ) {
			this.matrix[r][c] = (Math.random() * (max - min)) + min;
		}
	}
}
// сумма всех значений
JBase.Matrix.prototype.sum = function () {
	var sum = 0;
	for (var r = this.Rows; r--; ) {
		for (var c = this.Cols; c--; ) {
			sum += this.matrix[r][c];
		}
	}
	return sum;
}

// Добавляет знгачение к указанной ячейке матрицы
JBase.Matrix.prototype.add = function (row, col, value) {
    value = parseFloat(value);
    if (this.validateBeforeGet(row, col)) {
        this.matrix[row][col] += value;
    }
}

// транспонирует текущую матрицу, возвращает новую
JBase.Matrix.prototype.transpose = function() {
    var new_matr = new JBase.Matrix(this.Cols, this.Rows);
    this.each(function (val, r, c) {
        new_matr.matrix[c][r] = val;
    });
    return new_matr;
}

//Возвращает указанную колонку матрици как новую матрицу; Нумерация колонок начинается с 0!
JBase.Matrix.prototype.getCol = function (col) {
    var matr = null;
    col = parseInt(col, 10);
    if ((col >= this.Cols) || (col < 0)) {
        throw new Error("Колонка #" + col + " - не существует");
    }
    matr = new JBase.Matrix(this.Rows, 1);
    for (var r = 0; r < this.Rows; r++) {
        matr.matrix[r][0] = this.matrix[r][col];
    }
    return matr;
}

//Возвращает указанную строку матрици как новую матрицу; Нумерация строк начинается с 0!
JBase.Matrix.prototype.getRow = function (row) {
    var matr = null;
    row = parseInt(row, 10);
    if ((row >= this.Rows) || (row < 0)) {
        throw new Error("Колонка #" + row + " - не существует");
    }
    matr = new JBase.Matrix(1, this.Cols);
    for (var c = 0; c < this.Cols; c++) {
        matr.matrix[0][c] = this.matrix[row][c];
    }
    return matr;
}

// Клонировать матрицу
JBase.Matrix.prototype.clone = function () {
    return new JBase.Matrix(this.matrix);
}

// Очистить все элементы
JBase.Matrix.prototype.clear = function () {
    for (var r = this.Rows; r--; ) {
        for (var c = this.Cols; c--; ) {
            this.matrix[r][c] = 0;
        }
    }
}

// Итератор
JBase.Matrix.prototype.each = function (callb) {
    if (typeof(callb) !== "function") {
        throw Error('Не верный входящий параметр');
    }
    for (var i = 0; i < this.Rows; i++) {
        for (var j = 0; j < this.Cols; j++) {
            callb(this.matrix[i][j], i, j);
        }
    }
}

// Перевести матрицу в одномерный массив
JBase.Matrix.prototype.toPackedArray = function() {
    var res = [];
    this.each(function(val){
        res.push(val);
    });
    return res;
}

// Устанавливает значения в матрицу из упакованного массива
// arr - упакованный массив
// index Индекс от которого будет начинаться считывание из упакованного массива (начиная с 0)
JBase.Matrix.prototype.fromPackedArray = function (arr, index) {
    var self = this;
    index = parseInt(index, 10);
    index = index < 0 ? 0 : index;

    if (!JBase.Matrix.checkArraySingleDim(arr)) {
        throw Error("Входящим параметром должна быть одномерный массив");
    }

    if (index >= arr.length) {
        throw  Error("Начальная позиция превышает размер массива!");
    }

    this.each(function (val, r, c) {
        if (index >= arr.length) {
            self.matrix[r][c] = 0;
        } else {
            self.matrix[r][c] = arr[index];
        }
        index ++;
    });
    return self;
}

//####################################### Свойства ##############################
//Является ли матрица квадратной
JBase.Matrix.prototype.isSquare = function () {
    return this.Rows === this.Cols;
}

//Определяет, является ли матрица вектором. Вектор имеет либо одну колонку, либо одну строку
JBase.Matrix.prototype.isVector = function () {
    if (this.Rows == 1) {
        return true;
    } else {
        return this.Cols == 1;
    }
}

//Определяет, являются ли все значения матрици нулевыми
JBase.Matrix.prototype.isZero = function () {
    for (var r = this.Rows; r--; ) {
        for (var c = this.Cols; c--; ) {
            if (this.matrix[r][c] != 0) {
                return false;
            }
        }
    }
    return true;
}
//////////////

//############################### Операторные методы ################################///
// Приплюсовать к текущей матрице значение (численное либо другую матрицу или массив)
JBase.Matrix.prototype.plus = function (val) {
    if (val instanceof JBase.Matrix) { // прибавляем матрицу
        JBase.Matrix.validRowColCount(this, val);
        for (var i = 0; i < this.Rows; i++) {
            for (var j = 0; j < this.Cols; j++) {
                this.matrix[i][j] += val.matrix[i][j];
            }
        }
    } else if (Array.isArray(val)){
        this.plus(new JBase.Matrix(val));
    } else { // прибавляем значение
        val = parseFloat(val);
        for (var i = 0; i < this.Rows; i++) {
            for (var j = 0; j < this.Cols; j++) {
               this.matrix[i][j] += val;
            }
        }
    }
    return this;
}

// Отнять от текущей матрицы значение (численное либо другую матрицу или массив)
JBase.Matrix.prototype.minus = function (val) {
    if (val instanceof JBase.Matrix) { // прибавляем матрицу
        JBase.Matrix.validRowColCount(this, val);
        for (var i = 0; i < this.Rows; i++) {
            for (var j = 0; j < this.Cols; j++) {
                this.matrix[i][j] -= val.matrix[i][j];
            }
        }
    } else if (Array.isArray(val)){
        this.minus(new JBase.Matrix(val));
    } else { // прибавляем значение
        val = parseFloat(val);
        this.plus(-1 * val);
    }
    return this;
}

// Умножение текущей матрицы на значение (численное либо другую матрицу или массив)
JBase.Matrix.prototype.multiply = function (val) {
    var new_matrix = null;
    if (val instanceof JBase.Matrix) {
        // доработать
        if (this.Cols != val.Rows) {
            throw Error('Число столбцов первой матрици должно быть равным числу строк второй');
        }
        new_matrix = new JBase.Matrix(this.Rows, val.Cols);

        for (var i = 0; i < this.Rows; i++) {
            for (var j = 0; j < this.Cols; j++) {
                for (var k = 0; k < val.Cols; k++) {
                    new_matrix.matrix[i][k] += this.matrix[i][j] * val.matrix[j][k];
                }
            }
        }
        return new_matrix;
    } else if (Array.isArray(val)){
        return this.multiply(new JBase.Matrix(val))
    } else { // множим значение
        val = parseFloat(val);
        for (var i = 0; i < this.Rows; i++) {
            for (var j = 0; j < this.Cols; j++) {
                this.matrix[i][j] *= val;
            }
        }
    }
    return this;
}

// Деление текущей матрицы на значение (численное либо другую матрицу или массив)
JBase.Matrix.prototype.divide = function (val) {
    var new_matrix = null;
    if (val instanceof JBase.Matrix) {
        // доработать
        if (this.Cols != val.Rows) {
            throw Error('Число столбцов первой матрици должно быть равным числу строк второй');
        }
        new_matrix = new JBase.Matrix(this.Rows, val.Cols);
        for (var i = 0; i < this.Rows; i++) {
            for (var j = 0; j < this.Cols; j++) {
                for (var k = 0; k < val.Cols; k++) {
                    new_matrix.matrix[i][k] += this.matrix[i][j] / val.matrix[j][k];
                }
            }
        }
        return new_matrix;
    } else if (Array.isArray(val)){
       return this.divide(new JBase.Matrix(val));
    } else {
        val = parseFloat(val);
        for (var i = 0; i < this.Rows; i++) {
            for (var j = 0; j < this.Cols; j++) {
                this.matrix[i][j] /= val;
            }
        }
    }
    return this;
}

////////////////////////////////// Статические //////////////////////////////////////
///Проверяет соответсвует ли размерность первой матрици, размерности второй
JBase.Matrix.validRowColCount = function (matr1, matr2) {
    if (!(matr1 instanceof JBase.Matrix) || !(matr2 instanceof JBase.Matrix)) {
        throw Error('Один из входящих параметров не является матрицой!');
    }

    if ((matr1.Cols) != (matr2.Cols)) {
        throw new Error("Чтобы добавить одну матрицу к второй, нужно чтобы " +
            "они имели одиннаковый размер: Матрица1 имеет " + matr1.Cols + " колонок, а Матрица2 - " + matr2.Cols);
    }

    if ((matr1.Rows) != (matr2.Rows)) {
        throw new Error("Чтобы добавить одну матрицу к второй, нужно чтобы " +
            "они имели одиннаковый размер: Матрица1 имеет " + matr1.Rows + " строк, а Матрица2 - " + matr2.Rows);
    }
}

// Проверяет подходит ли массив для создания матрицы
JBase.Matrix.checkArray = function (array) {
    var second_dim_len_found = false,
        second_dim_len = 0;
    if (!Array.isArray(array)) {
        return false;
    }

    for (var i = 0, len1 = array.length; i < len1; i++) {
        if (!second_dim_len_found) {
            if (!Array.isArray(array[i])) {
                return false;
            }
            second_dim_len = array[i].length;
            second_dim_len_found = true;
        }

        // проверка на одиннаковую размерность
        if (array[i].length != second_dim_len) {
            return false;
        }

        for (var j = 0, len2 = array[i].length; j < len2; j++) {
            if (Array.isArray(array[i][j])) {
                return false;
            }
        }
    }
    return true;
}

// Сдедит за тем что-бы был одномерный массив корректных значений (без undefined и функций)
JBase.Matrix.checkArraySingleDim = function (arr) {
    var type = '';
    if (!Array.isArray(arr)) {
        return false;
    }
    for (var i = arr.length; i--; ) {
        type = typeof(arr[i]);
        if (type == "undefined" || type == "object" || type == "function") {
            return false;
        }
    }
    return true;
}

// Создание матрици чисел, которая содержит одну строку, из одномерного массива
JBase.Matrix.createRowMatrix = function (source_array) {
    var matr = null;
    if (JBase.Matrix.checkArraySingleDim(source_array)) {
        matr = new JBase.Matrix(1,source_array.length);
        for (var c = 0; c < source_array.length; c++) {
            matr.matrix[0][c] = source_array[c];
        }
        return matr;
    } else {
        throw Error("Ошибка во входящих данных");
    }
}

//Создание матрици, которая содержит одну колонку, из одномерного массива
JBase.Matrix.createColumnMatrix = function (source_array) {
    var matr = null;
    if (JBase.Matrix.checkArraySingleDim(source_array)) {
        matr = new JBase.Matrix(source_array.length, 1);
        for (var r = 0; r < source_array.length; r++) {
            matr.matrix[r][0] = source_array[r];
        }
        return matr;
    } else {
        throw Error("Ошибка во входящих данных");
    }
}

// создает квадратную матрицу с нулями на главной диагонали
JBase.Matrix.createIdentityMatrix = function (size) {
    var matr;
    size = parseInt(size);
    matr = new JBase.Matrix(size, size);
    for (var i = 0; i < size; i++) {
        matr.matrix[i][i] = 1;
    }
    return matr;
}

//#############################################################################################################################################

// Матричные операции
JBase.MatrixMath = {
    descr: "Матричные операции",
    dotProduct: function (matr1, matr2) { // скалярное произведение двух векторных матриц
        var m1 = [], m2 = [], res = 0;
        if (!(matr1 instanceof JBase.Matrix) || !(matr2 instanceof JBase.Matrix)) {
            throw Error('Входящие параметры должны быть матрицами!');
        }

        if (!(matr1.isVector()) || !(matr2.isVector())) {
            throw Error("Обе матрицы должны быть векторными");
        }

        if (matr1.Size != matr2.Size) {
            throw Error("Матрицы должны иметь одиннаковую размерность");
        }
        m1 = matr1.toPackedArray();
        m2 = matr2.toPackedArray();
        for (var i = 0; i < matr1.Size; i++) {
            res += m1[i] * m2[i];
        }
        return res;
    }

};
