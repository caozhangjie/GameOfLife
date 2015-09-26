//全局变量定义
var canvas_width; //画布宽
var canvas_height; //画布高
var canvas;   //绘图画布
var canvasContext = null;
var canvasBuffer;  //实现双缓冲的中间画布
var canvasBufferContext = null;
var row_number;
var col_number;
var cell_width = 4;
var usr_width = 4;
var is_live;
var is_liveBuffer;
var DrawInterval = 1000 / 10;

//Bool状态
var is_start = false;
var is_paused;
var is_single;
var is_sizechanged = true;

//游戏主结构
$(window).load(function(){
	//添加事件监视，按钮响应
	addEvent();
	//开始游戏主循环
	Start();
})
function Start(){
	gameLoop = setInterval(GameLoop, DrawInterval);
}
function GameLoop(){
	if(!is_start)
		return;
	if(is_paused)
		return;
	Draw();
	Update();
}

//游戏函数
function addEvent(){
	//开始按钮 包括游戏初始化
	$("#start").click(function(){
		is_start = true;
		is_single = false;
		is_paused = false;
		$("#start").text("重新开始");
		$("#pause").text("暂停");

		if(is_sizechanged){
			cell_width = usr_width;
			$("#current_size").remove();
			$('body').append("<div id='current_size'>当前细胞大小：" + cell_width + "  重新开始后细胞大小将改为:" + usr_width + "</div>");
			Initialize();
		}
		else{
			for(var i = 1; i < row_number + 1; i++){
				for(var j = 1; j < col_number + 1; j++){
					is_live[i][j] = (Math.floor(Math.random() * 1000 + 2) % 3 + 1) & 1;
					is_liveBuffer[i][j] = is_live[i][j];
				}
			}
		}
		
	});

	$("#pause").click(function(){
		if(!is_paused && is_start && !is_single){
			$("#pause").text("继续");
			is_paused = true;
		}
		else{
			if(is_single)
				return;
			$("#pause").text("暂停");
			is_paused = false;
		}
	});

	$("#single").click(function(){
		if(!is_single && is_start){
			is_single = true;
			$("#pause").text("继续");
		}
		else{
			is_paused = false;
		}
	});

	$("#continue").click(function(){
		if(is_single && is_start){
			$("#pause").text("暂停");
			is_single = false;
			is_paused = false;
		}
	});

	$("#ready").click(function(){
		if(is_start){
			usr_width = eval(document.getElementById("size")).value;
			
			if(usr_width === cell_width){
				is_sizechanged = false;
			}
			else{
				$("#current_size").remove();
				$('body').append("<div id='current_size'>当前细胞大小：" + cell_width + '\n' + "重新开始后细胞大小将改为:" + usr_width + "</div>");
				is_sizechanged = true;
			}
		}
	});
}

//游戏初始化
function Initialize(){

	canvas_width = 1000;
	canvas_height = 600;


	row_number = Math.floor(canvas_height / cell_width);
	col_number = Math.floor(canvas_width / cell_width);

	is_live = new Array(row_number + 2);
	is_liveBuffer = new Array(row_number + 2);

	var width = document.body.clientwidth;
	canvas = document.getElementById('canvas');
	canvasBuffer = document.createElement('canvas');
	canvas.width = canvas_width;
	canvas.height = canvas_height;
	canvasBuffer.width = canvas.width;
	canvasBuffer.height = canvas.height;
	canvasBufferContext = canvasBuffer.getContext('2d');

	if(canvas){
		canvasContext = canvas.getContext('2d');
	}

	for(var i = 1; i < row_number + 1; i++){
		is_live[i] = new Array(col_number + 2);
		is_liveBuffer[i] = new Array(col_number + 2);
		for(var j = 1; j < col_number + 1; j++){
			is_live[i][j] = (Math.floor(Math.random() * 1000 + 2) % 3 + 1) & 1;
			is_liveBuffer[i][j] = is_live[i][j];
		}
	}

	is_live[0] = new Array(col_number + 2);
	is_live[row_number + 1] = new Array(col_number + 2);
	is_liveBuffer[0] = new Array(col_number + 2);
	is_liveBuffer[row_number + 1] = new Array(col_number + 2); 

	for(var i = 0; i < col_number + 2; i++){
		is_live[0][i] = 0;
		is_live[row_number + 1][i] = 0;
	}
	for(var i = 0; i < row_number + 2; i++){
		is_live[i][0] = 0;
		is_live[i][col_number + 1] = 0; 
	}

}

//更新画布
function Update(){
	for(var i = 1; i < row_number + 1; i++){
		for(var j = 1; j < col_number + 1; j++){
			changeState(i, j);
		}
	}

	for(var i = 1; i < row_number + 1; i++){
		for(var j = 1; j < col_number + 1; j++){
			is_live[i][j] = is_liveBuffer[i][j];
		}
	}
	if(is_single){
		is_paused = true;
	}
}

//判断是否改变状态
function changeState(i, j){
	var lived_cell = 0;

	lived_cell = is_live[i-1][j-1]+is_live[i-1][j]+is_live[i-1][j+1]
				+is_live[i][j-1]+is_live[i][j+1]+is_live[i+1][j-1]+
				is_live[i+1][j]+is_live[i+1][j+1];

	if(lived_cell === 3){
		is_liveBuffer[i][j] = 1;
	}
	else if(lived_cell === 2){
		return;
	}
	else{
		is_liveBuffer[i][j] = 0;
	}

}

//画图函数
function Draw(){
	canvasBufferContext.clearRect(0,0,canvasBuffer.width,canvasBuffer.height);
	canvasContext.clearRect(0,0,canvas.width,canvas.height);
	for(var i = 1; i < row_number + 1; i++){
		for(var j = 1; j < col_number + 1; j++){
			canvasBufferContext.save();
			if(is_live[i][j] == 1){
				canvasBufferContext.fillStyle = "rgb(255, 255, 255)";
			}
			else{
				canvasBufferContext.fillStyle = "rgb(0, 0, 0)";
			}
			canvasBufferContext.fillRect(cell_width * (j - 1), cell_width * (i - 1), cell_width, cell_width);
			canvasBufferContext.restore();
		}
	}
	canvasContext.drawImage(canvasBuffer,0,0);
}



























