JBase.namespace("Neural.Hopfield");
JBase.Neural.Hopfield = (function () {
    var Matrix = JBase.Matrix,
        MatrixMath = JBase.MatrixMath,
        BipolarOps = JBase.BipolarOps,
        ArrayExplicted = JBase.ArrayExplicted,
        constructor,
        weight_matrix;

    // указываем количество нейронов в Матрице
    constructor = function (neurons) {
        neurons = parseInt(neurons, 10);
        if (neurons <= 0) {
            throw Error("Не верное количество нейронов в конструкторе");
        }
        weight_matrix = new Matrix(neurons, neurons);
        this.size = neurons;
    };

    // Обучить сеть, на основании входящего булеановского или бинарного массива
    constructor.prototype.train = function (pattern) {
        var contribution_matrix,
            pattern_row_matrix
        if (!Matrix.checkArraySingleDim(pattern)) {
            throw Error("Не корректный шаблон для обучения!");
        }
        if (pattern.length != this.size) {
            throw Error("Длина входящего шаблона должна соответсвовать размеру НС!");
        }
        pattern_row_matrix = Matrix.createRowMatrix(BipolarOps.convertBipolar(pattern, BipolarOps.toFloat));
        contribution_matrix = pattern_row_matrix.transpose().multiply(pattern_row_matrix).minus(new Matrix.createIdentityMatrix(this.size));
        weight_matrix.plus(contribution_matrix);
    };

    // распознать входящий шаблон (рез-тат возвр бинарнім массивом)
    constructor.prototype.present = function (inp) {
        var res_arr,
            inp_row_matr,
            threshold = 0; // порог
        if (!Matrix.checkArraySingleDim(inp)) {
            throw Error("Не корректный шаблон для распознания!");
        }

        if (inp.length != this.size) {
            throw Error("Длина входящего шаблона должна соответсвовать размеру НС!");
        }

        res_arr = new ArrayExplicted([inp.length], "inp");
        inp_row_matr = Matrix.createRowMatrix(BipolarOps.convertBipolar(inp, BipolarOps.toFloat));

        for (var c = 0; c < inp.length; c++) {
            res_arr.array[c] = MatrixMath.dotProduct(weight_matrix.getCol(c), inp_row_matr) > threshold ? 1 : 0;
        }

        return res_arr.array;
    };

    // Получить мартицу весов
    constructor.prototype.getWeightMatrix = function () {
        return weight_matrix;
    };

    return constructor;
})();
JBase.Neural.Hopfield.descr = "Нейронная сеть Хопфилда";