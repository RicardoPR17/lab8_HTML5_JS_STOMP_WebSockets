var app = (function () {
  class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }

  class Polygon {
    constructor(points) {
      this.points = points;
    }
  }

  var stompClient = null;

  var addPointToCanvas = function (point) {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.stroke();
  };

  var addPolygonToCanvas = function (polygon) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "pink";
    ctx.beginPath();
    ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
    for (let i = 1; i < polygon.points.length; i++) {
      ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  var getMousePosition = function (evt) {
    canvas = document.getElementById("canvas");
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  };

  var connectAndSubscribe = function (topic) {
    if (topic) {
      var socket = new SockJS("/stompendpoint");
      stompClient = Stomp.over(socket);

      //subscribe to /topic/TOPICXX when connections succeed
      stompClient.connect({}, function (frame) {
        console.log("Connected: " + frame);
        stompClient.subscribe("/topic/newpoint." + topic, function (eventbody) {
          var JSONevent = JSON.parse(eventbody.body);
          var x = JSONevent.x;
          var y = JSONevent.y;
          /* alert(x + ", " + y); */

          // Dibujar punto con las coordenadas enviadas
          var point = new Point(x, y);
          addPointToCanvas(point);
        });

        stompClient.subscribe("/topic/newpolygon." + topic, function (eventbody) {
          let JSONevent = JSON.parse(eventbody.body);
          let polygon = new Polygon(JSONevent);
          addPolygonToCanvas(polygon);
        });
      });
    } else {
      alert("Ingrese un número de topic para conectarse");
    }
  };

  return {
    init: function () {
      var canvas = document.getElementById("canvas");

      var topic = $("#drawId").val();

      canvas.addEventListener("pointerdown", function (evt) {
        var click = getMousePosition(evt);
        app.publishPoint(click.x, click.y, topic);
      });

      alert("Connected to: /app/newpoint." + topic);
      connectAndSubscribe(topic);
    },

    publishPoint: function (px, py, topic) {
      var pt = new Point(px, py);
      console.info("publishing point at " + pt);
      addPointToCanvas(pt);

      //publicar el evento
      //enviando un objeto creado a partir de una clase
      stompClient.send("/app/newpoint." + topic, {}, JSON.stringify(pt));
    },

    disconnect: function () {
      if (stompClient !== null) {
        stompClient.disconnect();
      }
      setConnected(false);
      console.log("Disconnected");
    },
  };
})();
