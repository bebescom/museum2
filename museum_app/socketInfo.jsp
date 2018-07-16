<%@ page import="com.museum.socket.MinaServer" %>
<%@ page import="org.apache.mina.core.session.IoSession" %>
<%@ page import="java.util.Map" %>
<%--
  Created by IntelliJ IDEA.
  User: yang
  Date: 2017/2/7
  Time: 13:45
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title></title>
</head>
<body>
在线消息推送客户端:<br>
<%
    Map<Long, IoSession> map = MinaServer.acceptor.getManagedSessions();
    for (Map.Entry<Long, IoSession> entry : map.entrySet()) {
%>
<br>
<%
    out.println(entry.getKey() + ":" + entry.getValue().getRemoteAddress());
%>
<br>
<%
    }
%>
</body>
</html>
