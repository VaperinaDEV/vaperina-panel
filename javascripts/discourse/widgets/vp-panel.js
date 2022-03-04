import { createWidget } from "discourse/widgets/widget";
import { ajax } from "discourse/lib/ajax";
import { 
  avatarImg,
  getRawSize,
} from "discourse/lib/utilities";
import getURL, { getURLWithCDN } from "discourse-common/lib/get-url";
import { userPath } from "discourse/lib/url";
import User from "discourse/models/user";
import DiscourseURL from "discourse/lib/url";
import { h } from "virtual-dom";
import Composer from "discourse/models/composer";
import { iconNode } from "discourse-common/lib/icon-library";

function getUser() {
  var user = User.current();
  return user;
}

createWidget('vp-avatar', {
  tagName: 'div.vp-avatar',
  
  userAvatarUrl() {
    let rawSize = getRawSize;
    return this.user.get('avatar_template').replace("{size}", rawSize(45));
  },

  html() {
    this.user = getUser();
    return [
      this.userAvatar(),
    ];
  },

  linkToUser() {
    return {
      href: `/u/${this.user.get('username')}/summary`,
    };
  },

  userAvatar() {
    return h('a', this.linkToUser(), [
      h('img.avatar', {
        loading: "lazy",
        width: 45,
        height: 45,
        src: getURLWithCDN(this.userAvatarUrl())
      })
    ]);
  },
});

createWidget('vp-topic', {
  tagName: 'div.vp-topic',
  
  html() {
    let container = Discourse.__container__;
    let ntb_text = "Írj egy új témát...";
    let ntb_icon = iconNode('pen');
    let ntb_button_class = "btn btn-default btn btn-icon-text new-create-topic";
    let ntb_button_helper = "button#new-create-topic";
    let ntb_label_helper = "span.d-button-label";
    const composerModal = require("discourse/models/composer").default;
    const composerController = container.lookup("controller:composer");

    const createTopic = function() {
      const controller = container.lookup("controller:navigation/category"),
        category = controller.get("category.id"),
        topicCategory = container
          .lookup("route:topic")
          .get("context.category.id"),
        categoryd = topicCategory ? topicCategory : category;

      composerController.open({
        action: composerModal.CREATE_TOPIC,
        categoryId: categoryd,
        draftKey: composerModal.draft_key || composerModal.NEW_TOPIC_KEY
      });
    };
    
    return h(
      ntb_button_helper,
      {
        className: ntb_button_class,
        onclick: createTopic
      },
      [ntb_icon, h(ntb_label_helper, ntb_text)]
    );
  },
});

createWidget('vp-stats', {
  tagName: 'div.vp-stats',
  
  html() {
    setupComponent(args, component) {
      let username = component.get("currentUser.username");
      
      fetch("https://raw.githubusercontent.com/VaperinaDEV/tudtad/main/index.json")
      .then(response => response.json())
      .then(quotes => {
        const rand = Math.floor(Math.random() * quotes.length);
        component.set('quote', quotes[rand]);
      });
      
      ajax("/u/" + username + "/summary.json").then (function(result) {

        const stinkinBadges = [];

        const userLikesReceived = result.user_summary.likes_received;
        const userLikesGiven = result.user_summary.likes_given;

        if (result.badges) {
          result.badges.forEach(function(badges){
            stinkinBadges.push(badges);
          });
        }

        component.set("userLikesReceived", userLikesReceived);
        component.set("userLikesGiven", userLikesGiven);
        component.set("stinkinBadges", stinkinBadges);
        component.set("userName", api.getCurrentUser().name);
        component.set("user", api.getCurrentUser().username);
      });
    }
  },
});


