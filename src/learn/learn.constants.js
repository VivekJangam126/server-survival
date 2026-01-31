const LEARN_CONCEPTS = {

  // =========================
  // 1. SERVERS
  // =========================
  servers: {
    title: "Servers (Compute Layer)",
    description: "Servers are where your application actually runs and processes requests.",
    video: `
      <iframe
        class="w-full aspect-video rounded-lg"
        src="https://www.youtube.com/embed/UjCDWCeHCzY"
        title="Servers Explained"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    `,
    sections: [
      {
        title: "What are servers?",
        text: "Servers execute application code, process user requests, and communicate with databases and storage."
      },
      {
        title: "Why servers fail?",
        text: "Servers have limited CPU and memory. Too many requests can overload them and cause crashes."
      },
      {
        title: "In Server Survival",
        text: "Overloaded servers cause request failures, reputation loss, and eventually game over."
      },
      {
        title: "Common Mistake",
        text: "❌ Assuming one powerful server is enough to handle all traffic."
      },
      {
        title: "Real-World Analogy",
        text: "🏭 Servers are like factory workers — too much work and they collapse."
      },
      {
        title: "Pro Tip",
        text: "💡 Scaling multiple small servers is safer than relying on one big server."
      }
    ]
  },

  // =========================
  // 2. LOAD BALANCER
  // =========================
  load_balancer: {
    title: "Load Balancer",
    description: "Distributes incoming traffic across multiple servers to prevent overload.",
    video: `
      <iframe
        class="w-full aspect-video rounded-lg"
        src="https://www.youtube.com/embed/sCR3SAVdyCc"
        title="Load Balancer Explained"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    `,
    sections: [
      {
        title: "What is a Load Balancer?",
        text: "A load balancer sits in front of servers and decides which server should handle each request."
      },
      {
        title: "Why it exists?",
        text: "Without a load balancer, a single server can become a bottleneck and crash."
      },
      {
        title: "In Server Survival",
        text: "Helps survive traffic spikes and keeps your system stable."
      },
      {
        title: "Common Mistake",
        text: "❌ Adding more servers without a load balancer still causes overload."
      },
      {
        title: "Real-World Analogy",
        text: "🚦 A load balancer is traffic police directing cars to different roads."
      },
      {
        title: "Pro Tip",
        text: "💡 Always remove unhealthy servers automatically from the load balancer."
      }
    ]
  },

  // =========================
  // 3. DOS & DDOS
  // =========================
  ddos: {
    title: "DoS & DDoS Attacks",
    description: "Attacks that overwhelm systems with massive fake traffic.",
    video: `
      <iframe
        class="w-full aspect-video rounded-lg"
        src="https://www.youtube.com/embed/nw2SBTgLLwc"
        title="DDoS Attacks Explained"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    `,
    sections: [
      {
        title: "What is a DDoS attack?",
        text: "A DDoS attack floods your system with fake requests to block real users."
      },
      {
        title: "Why systems fail?",
        text: "Servers cannot distinguish fake traffic without protection mechanisms."
      },
      {
        title: "In Server Survival",
        text: "Attacks rapidly reduce reputation and income if not handled."
      },
      {
        title: "Common Mistake",
        text: "❌ Treating DDoS traffic like normal traffic spikes."
      },
      {
        title: "Real-World Analogy",
        text: "📞 Millions of fake phone calls blocking real customers."
      },
      {
        title: "Pro Tip",
        text: "💡 Detecting attacks early is as important as blocking them."
      }
    ]
  },

  // =========================
  // 4. FIREWALL
  // =========================
  firewall: {
    title: "Firewall",
    description: "Filters and blocks malicious traffic before it reaches servers.",
    video: `
      <iframe
        class="w-full aspect-video rounded-lg"
        src="https://www.youtube.com/embed/kDEX1HXybrU"
        title="Firewall Explained"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    `,
    sections: [
      {
        title: "What is a Firewall?",
        text: "A firewall monitors incoming traffic and blocks requests based on security rules."
      },
      {
        title: "Why it is needed?",
        text: "Without a firewall, malicious traffic directly hits your servers."
      },
      {
        title: "In Server Survival",
        text: "Firewalls block attacks and protect reputation."
      },
      {
        title: "Common Mistake",
        text: "❌ Placing the firewall after servers instead of before them."
      },
      {
        title: "Real-World Analogy",
        text: "🛡️ A security guard checking IDs before allowing entry."
      },
      {
        title: "Pro Tip",
        text: "💡 Security rules must evolve with traffic patterns."
      }
    ]
  }
};
