<% @stations.each do |station| %>
    <tr>
       <td><%= station["id"] %></td>
       
       <td><%= station["station_name"] %></td>
       
       <td><%= station["station_phone"] %></td>
      
       <td><%=station["city"] %></td>
    </tr>
  <% end %>