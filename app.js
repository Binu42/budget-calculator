// Budget Controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    }

    var calculateTotal = function (type) {
        sum = 0;
        data.allItems[type].forEach(function (item) {
            sum += item.value;
        })
        data.totals[type] = sum;
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;

        },
        calculateBudget: function () {
            // Total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // net worth
            data.budget = data.totals.inc - data.totals.exp;

            // percentage of income we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            } 
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data);
        }
    }

})();

// user interface controller
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputValue: '.add__value',
        inputDescription: '.add__description',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: ".container"
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        getDOMStrings: function () {
            return DOMStrings;
        },
        addListItem: function (obj, type) {
            var html, element;
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="income-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">+ ${obj.value}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = `<div class="item clearfix" id="expense-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">- ${obj.value}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }

            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        clearField: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
            if (obj.percentage != -1) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        }
    }
})();

// Global application controller
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOMStrings = UICtrl.getDOMStrings();
        document.querySelector(DOMStrings.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOMStrings.container).addEventListener('click', ctrlDeleteItem);

    }

    var updateBudget = function () {
        // calculate Budget
        budgetCtrl.calculateBudget();

        // Returned Budget
        var budget = budgetCtrl.getBudget();

        // Display of budget to UI
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function () {
        // User input field Data
        var input = UICtrl.getInput();

        if (input.description !== "" && input.value !== NaN && input.value > 0) {
            // Add item to budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add Item to Ui
            UICtrl.addListItem(newItem, input.type);

            // Clearing input of Ui
            UICtrl.clearField();

            // Calculate and update budget
            updateBudget();
        }
    }

    var ctrlDeleteItem = function(event){
        const itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            const splitId = itemId.splitId('-');
            const type = splitId[0];
            const id = splitId[1];
        }
    }

    return {
        init: function () {
            console.log('Applications has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();