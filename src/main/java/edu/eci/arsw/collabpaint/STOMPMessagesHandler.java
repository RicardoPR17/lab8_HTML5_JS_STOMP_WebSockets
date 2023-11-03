package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Controller
public class STOMPMessagesHandler {
    @Autowired
    SimpMessagingTemplate msgt;

    ConcurrentHashMap<String, CopyOnWriteArrayList<Point>> draws = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:" + pt);
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);

        draws.putIfAbsent(numdibujo, new CopyOnWriteArrayList<>());
        draws.get(numdibujo).add(pt);

        if (draws.get(numdibujo).size() >= 4) {
            System.out.println("Nuevo poligono recibido en el servidor!:" + draws.get(numdibujo));
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, draws.get(numdibujo));
            draws.get(numdibujo).clear();
        }
    }
}
