CellEnum = {
    ERROR: 0,
    EMPTY: 1,
    FILLED: 2,
    CROSSED: 3
};

function Grid(width, height, defaultValue) {
    defaultValue = defaultValue || CellEnum.EMPTY;
    var self = this;
    this.gridWidth = width;
    this.gridHeight = height;
    this.data = new Array(this.gridWidth * this.gridHeight);
    for (var i = 0; i < this.data.length; i ++) {
        this.data[i] = defaultValue;
    }
}

Grid.prototype.randomize = function() {
    for (var i = 0; i < this.gridWidth * this.gridHeight; i ++) {
        this.data[i] = (Math.random() > 0.5) ? CellEnum.FILLED : CellEnum.EMPTY;
    }
};

Grid.prototype.filled = function(x, y) {
    return (this.data[y * this.gridWidth + x] == CellEnum.FILLED);
};

Grid.prototype.getCell = function(x, y) {
    return this.data[y * this.gridWidth + x];
};

Grid.prototype.setCell = function(x, y, value) {
    var i = y * this.gridWidth + x;
    this.data[i] = value;
};

//Format example: [[2], [1,8,9], [2], [3], [2], [2], [2], [2], [2,7], [2]];
Grid.prototype.getColumnClues = function() {
    var columnClues = new Array(this.gridWidth);
    for (var x = 0; x < this.gridWidth; x ++) {
        var numbers = new Array();
        var filledCount = 0;
        for (var y = 0; y < this.gridHeight; y ++) {
            if (this.filled(x, y)) {
                filledCount += 1;
            }
            else {
                if (filledCount > 0) {
                    numbers.push(filledCount);
                    filledCount = 0;
                }
            }
        }
        
        if (filledCount > 0) {
            numbers.push(filledCount);
            filledCount = 0;
        }
        
        columnClues[x] = numbers;
    }
    
    return columnClues;
};

//Format example: [[2], [1,8,9], [2], [3], [2], [2], [2], [2], [2,7], [2]]
Grid.prototype.getRowClues = function() {
    var rowClues = new Array(this.gridHeight);
    for (var y = 0; y < this.gridHeight; y ++) {
        var numbers = new Array();
        var filledCount = 0;
        for (var x = 0; x < this.gridWidth; x ++) {
            if (this.filled(x, y)) {
                filledCount += 1;
            }
            else {
                if (filledCount > 0) {
                    numbers.push(filledCount);
                    filledCount = 0;
                }
            }
        }
        
        if (filledCount > 0) {
            numbers.push(filledCount);
            filledCount = 0;
        }
        
        rowClues[y] = numbers;
    }
    
    return rowClues;
};


function NonogramGrid() {
    var self = this;
    this.gridWidth = 10;
    this.gridHeight = 10;
    this.solutionGrid = new Grid(this.gridWidth, this.gridHeight);
    this.solutionGrid.randomize();
    this.gridColors = new Grid(this.gridWidth, this.gridHeight, "#000");
    this.grid = new Grid(this.gridWidth, this.gridHeight);
    
    this.columnClues = this.solutionGrid.getColumnClues();
    this.rowClues = this.solutionGrid.getRowClues();
    
    var $canvas  = $('#nonogramCanvas');
    $canvas.attr("width", 241);
    $canvas.attr("height", 241);
    
    $canvas.bind('click',
        function(e) {
            var offset = $canvas.offset();
            self.onClick(
                e.pageX - offset.left,
                e.pageY - offset.top
            );
        }
    );
    
    var canvas = document.getElementById("nonogramCanvas");
    var context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000";
    context.fillText("Loading...", 16, 16);
    
    this.numberSheet = new Image();
    this.numberSheet.onload = function() {
        //Clear "Loading..." text.
        context.fillStyle = "#FFF";
        context.fillRect(0, 0, 79, 79);
        self.drawCells();
        self.draw();
    };
    this.numberSheet.src = "img/numbers.png";
    
    $('#solveButton').bind('click',
        function(e) {
            for (var x = 0; x < self.gridWidth; x ++) {
                for (var y = 0; y < self.gridHeight; y ++) {
                    if (self.solutionGrid.filled(x, y)) self.grid.setCell(x, y, CellEnum.FILLED);
                    else self.grid.setCell(x, y, CellEnum.CROSSED);
                }
            }
            
            self.onClick(0, 0);
            self.drawCells(true);
        }
    );
};

NonogramGrid.prototype.solved = function() {
    if (this.grid.getColumnClues().toString() == this.columnClues.toString()) {
        if (this.grid.getRowClues().toString() == this.rowClues.toString()) {
            return true;
        }
    }
    
    return false;
};

NonogramGrid.prototype.onClick = function(canvasX, canvasY) {
    var rectSize = 16;
    var gridX = Math.floor(canvasX / rectSize) - 5;
    var gridY = Math.floor(canvasY / rectSize) - 5;
    
    if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
        if (this.grid.getCell(gridX, gridY) == CellEnum.EMPTY) this.grid.setCell(gridX, gridY, CellEnum.FILLED);
        else if (this.grid.getCell(gridX, gridY) == CellEnum.FILLED) this.grid.setCell(gridX, gridY, CellEnum.CROSSED);
        else if (this.grid.getCell(gridX, gridY) == CellEnum.CROSSED) this.grid.setCell(gridX, gridY, CellEnum.EMPTY);
        else {
            this.grid.setCell(gridX, gridY, CellEnum.ERROR);
            console.log("Invalid grid value.");
         }
    }
    
    var canvas = document.getElementById("nonogramCanvas");
    var context = canvas.getContext("2d");
    context.fillStyle = "#FFF";
    context.fillRect(0, 0, 79, 79);
    if (this.solved()) {
        context.fillStyle = "#000";
        context.fillText("SOLVED!!!", 16, 16);
        
        this.drawCells(true);
    }
    else {
        this.drawCells(false);
    }
};

NonogramGrid.prototype.drawCells = function(useColors) {
    var rectSize = 16;
    var canvas = document.getElementById("nonogramCanvas");
    var context = canvas.getContext("2d");
    
    for (var x = 0; x < this.gridWidth; x ++) {
        for (var y = 0; y < this.gridHeight; y ++) {
            if (this.grid.getCell(x, y) == CellEnum.EMPTY) context.fillStyle = "#FFF";
            if (this.grid.getCell(x, y) == CellEnum.FILLED) context.fillStyle = useColors ? this.gridColors.getCell(x, y) : "#000";
            if (this.grid.getCell(x, y) == CellEnum.CROSSED) context.fillStyle = "#FFF";
            
            var px = 1 + (5 + x) * rectSize;
            var py = 1 + (5 + y) * rectSize;
            context.fillRect(px, py, rectSize - 1, rectSize - 1)
            
            if (this.grid.getCell(x, y) == CellEnum.CROSSED) {
                context.strokeStyle = "#555";
                context.beginPath();
                context.moveTo(px, py);
                context.lineTo(px + rectSize - 1, py + rectSize - 1);
                context.stroke();
                context.beginPath();
                context.moveTo(px, py + rectSize - 1);
                context.lineTo(px + rectSize - 1, py);
                context.stroke();
            }
        }
    }
};

NonogramGrid.prototype.draw = function() {
    var canvas = document.getElementById("nonogramCanvas");
    var context = canvas.getContext("2d");
    
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    var rectSize = 16;
    
    for (var red in [0, 1]) {
        for (var axis = 0; axis <= 1; axis ++) {
            for (var i = 0; i <= 15; i ++) {
                if (red == 1) {
                    if (Number(i % 5) != Number(0)) continue
                }
                
                if (red == 0) {
                    if (Number(i % 5) == Number(0)) continue
                }
                
                var lineStart = [0, 0]
                var lineEnd = [0, 0]
                
                var perpendicularAxis = (axis + 1) % 2
                
                if (i < 5) {
                    lineStart[axis] = 5 * rectSize
                    lineStart[perpendicularAxis] = i * rectSize
                }
                else {
                    lineStart[axis] = 0
                    lineStart[perpendicularAxis] = i * rectSize
                }
                
                lineEnd[axis] = 15 * rectSize
                lineEnd[perpendicularAxis] = i * rectSize
                
                context.beginPath()
                context.moveTo(lineStart[0] + 0.5, lineStart[1] + 0.5)
                context.lineTo(lineEnd[0] + 0.5, lineEnd[1] + 0.5)
                
                if (red == 1) {context.strokeStyle = "#e00";}
                if (red == 0) {context.strokeStyle = "#555";}
                
                context.stroke()
            }
        }
    }
    
    var textHeight = 12;
    var border = 1;
    var spriteSize = 14;
    context.fillStyle = "#000";
    
    for (var i = 0; i < this.columnClues.length; i ++) {
        for (var j = 0; j < this.columnClues[i].length; j ++) {
            context.drawImage(
                this.numberSheet,
                spriteSize * this.columnClues[i][j], 0, // clip x/y
                spriteSize, spriteSize, // clip w/h
                border + 1 + (5 + i) * rectSize, // x
                border + (5 - this.columnClues[i].length + j) * rectSize, // y
                spriteSize, spriteSize // w/h
            );
        }
    }
    
    for (var i = 0; i < this.rowClues.length; i ++) {
        for (var j = 0; j < this.rowClues[i].length; j ++) {
            context.drawImage(
                this.numberSheet,
                spriteSize * this.rowClues[i][j], 0, // clip x/y
                spriteSize, spriteSize, // clip w/h
                border + 1 + (5 - this.rowClues[i].length + j) * rectSize, // x
                border + (5 + i) * rectSize, // y
                spriteSize, spriteSize // w/h
            );
        }
    }
};

$(document).ready(function() {
    var grid = new NonogramGrid();
    
    $("#explanationButton").bind("click", function() {
        if ($("#explanationDiv").is(':hidden')) {
            $("#explanationDiv").slideDown();
            $("#explanationDiv").fadeIn();
        }
        else {
            $("#explanationDiv").slideUp();
            $("#explanationDiv").fadeOut();
        }
    });
});