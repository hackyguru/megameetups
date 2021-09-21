const moment = require("moment-timezone");
const utils = require("../utils");
const queries = require("../queries");

exports.dashboard = async (req, res) => {
  try {
    let response = await utils.axios.post("https://api.meetup.com/gql", {
      query: queries.get_groups_events,
      variables: `{
                "urlname": "${req.session.network_url}" 
            }`,
    });

    let data = response.data.data;

    let { groups, events, event_groups_map } = utils.parse_get_events(data);

    let current_event = events[0];

    if (current_event === undefined) {
      return res.render("dashboard", {
        name: data.self.name,
        groups: groups,
        events: [],
      });
    }

    let current_event_groups = [];

    current_event.groups.forEach((group) => {
      current_event_groups.push(group.urlname);
    });

    response = await utils.axios.post("https://api.meetup.com/gql", {
      query: queries.get_event,
      variables: `{
                "eventId": "${current_event.groups[0].event_id}" 
            }`,
    });

    let event_data = response.data.data.event;

    event_data["dateTime"] = moment
      .parseZone(event_data.dateTime)
      .format("YYYY-MM-DD[T]HH:mm");

    return res.render("dashboard", {
      name: data.self.name,
      groups: groups,
      events: events,
      current_event_groups: current_event_groups,
      current_event: event_data,
    });
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
};

exports.show = async (req, res) => {
  try {
    let response = await utils.axios.post("https://api.meetup.com/gql", {
      query: queries.get_groups_events,
      variables: `{
                    "urlname": "${req.session.network_url}" 
                }`,
    });

    let data = response.data.data;

    let { groups, events, event_groups_map } = utils.parse_get_events(data);

    let current_event = event_groups_map[req.params.event_title];

    if (current_event === undefined) {
      return res.send(404, event_groups_map);
    }

    let current_event_groups = [];

    current_event.forEach((group) => {
      current_event_groups.push(group.urlname);
    });

    response = await utils.axios.post("https://api.meetup.com/gql", {
      query: queries.get_event,
      variables: `{
                "eventId": "${current_event[0].event_id}" 
            }`,
    });

    let event_data = response.data.data.event;

    event_data["dateTime"] = moment
      .parseZone(event_data.dateTime)
      .format("YYYY-MM-DD[T]HH:mm");

    return res.render("dashboard", {
      name: data.self.name,
      groups: groups,
      events: events,
      current_event_groups: current_event_groups,
      current_event: event_data,
    });
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
};

exports.update = async (req, res) => {
  try {
    let response = await utils.axios.post("https://api.meetup.com/gql", {
      query: queries.get_groups_events,
    });

    let data = response.data.data;

    let { groups, events, event_groups_map } = utils.parse_get_events(data);

    let current_event = event_groups_map[req.body.old_title];

    if (current_event === undefined) {
      return res.send(404, event_groups_map);
    }

    let title = req.body.title;
    let description = req.body.description;
    let dateTime = req.body.dateTime;
    let duration = req.body.duration;

    let events_needed_to_deleted = [];
    let groups_input = req.body.groups;

    if (groups_input == undefined) {
      return res.send(400, "Please select atleast one group");
    }

    for (const event of current_event) {
      if (groups_input.indexOf(event.urlname) === -1) {
        events_needed_to_deleted.push(event.event_id);
      } else {
        groups_input = groups_input.filter((group) => {
          return group !== event.urlname;
        });

        response = await utils.axios.post("https://api.meetup.com/gql", {
          query: queries.edit_event,
          variables: `{
                        "input": {
		                    "eventId": "${event.event_id}",
                            "title": "${title}",
                            "description": "${description}",
                            "startDateTime": "${dateTime}",
                            "duration": "${duration}"
	                    }
                    }`,
        });
      }
    }

    for (const group of groups_input) {
      response = await utils.axios.post("https://api.meetup.com/gql", {
        query: queries.create_event_draft,
        variables: `{
                    "input": {
                        "groupUrlname": "${group}",
                        "title": "${title}",
                        "description": "${description}",
                        "startDateTime": "${dateTime}",
                        "venueId": "online",
                        "duration": "${duration}"
                    }
                }`,
      });
      let event_id = response.data.data.createEventDraft.event.id;

      await utils.axios.post("https://api.meetup.com/gql", {
        query: queries.publish_event,
        variables: `{
                        "input": {
                            "eventId": "${event_id}"
                        }
                    }`,
      });
    }

    for (const event of events_needed_to_deleted) {
      await utils.axios.post("https://api.meetup.com/gql", {
        query: queries.delete_event,
        variables: `{
                    "input": {
                        "eventId": "${event}"
                    }
                }`,
      });
    }

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
};

exports.create = async (req, res) => {
  try {
    let response = await utils.axios.post("https://api.meetup.com/gql", {
      query: queries.get_groups_events,
    });

    let data = response.data.data;

    let { groups, events, event_groups_map } = utils.parse_get_events(data);

    return res.render("create_event", {
      name: data.self.name,
      groups: groups,
      events: events,
    });
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
};

exports.store = async (req, res) => {
  try {
    let groups_input = req.body.groups;
    let title = req.body.title;
    let description = req.body.description;
    let dateTime = req.body.dateTime;
    let duration = req.body.duration;
    let response = "";

    for (const group of groups_input) {
      response = await utils.axios.post("https://api.meetup.com/gql", {
        query: queries.create_event_draft,
        variables: `{
                    "input": {
                        "groupUrlname": "${group}",
                        "title": "${title}",
                        "description": "${description}",
                        "startDateTime": "${dateTime}",
                        "venueId": "online",
                        "duration": "${duration}"
                    }
                }`,
      });

      let event_id = response.data.data.createEventDraft.event.id;

      await utils.axios.post("https://api.meetup.com/gql", {
        query: queries.publish_event,
        variables: `{
                    "input": {
                        "eventId": "${event_id}"
                    }
                }`,
      });
    }

     return res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
};

exports.delete = async (req, res) => {
  try {
    let response = await utils.axios.post("https://api.meetup.com/gql", {
      query: queries.get_groups_events,
    });

    let data = response.data.data;

    let { groups, events, event_groups_map } = utils.parse_get_events(data);

    let title = req.body.title;
    let current_event = event_groups_map[title];

    if (current_event === undefined) {
      return res.send(404, event_groups_map);
    }

    let events_needed_to_deleted = [];

    current_event.forEach((event) => {
      events_needed_to_deleted.push(event.event_id);
    });

    for (const event of events_needed_to_deleted) {
      response = await utils.axios.post("https://api.meetup.com/gql", {
        query: queries.delete_event,
        variables: `{
                        "input": {
                            "eventId": "${event}"
                        }
                    }`,
      });
    }

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
};
