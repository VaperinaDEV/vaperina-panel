import { createWidget } from "discourse/widgets/widget";
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
  tagName: '',

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

    const createTopic = function() {
      const controller = container.lookup("controller:navigation/category"),
        category = controller.get("category.id"),
        topicCategory = container
          .lookup("route:topic")
          .get("context.category.id"),
        categoryd = topicCategory ? topicCategory : category;

      this.controllerFor("composer").open({
        action: Composer.CREATE_TOPIC,
        categoryId: categoryd,
        draftKey: controller.get("model.draft_key") || Composer.NEW_TOPIC_KEY,
        draftSequence: controller.get("model.draft_sequence") || 0,
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
