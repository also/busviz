var MPH_TO_KPS = 0.00044704;

var presets = {
  'base': {
    speed_gradient_min: 10 * MPH_TO_KPS,
    speed_gradient_max: 50 * MPH_TO_KPS,
    line_width: 1,
    line_cap: 'butt',
    color: null,
    alpha: 0.3,
    fade_alpha: 0.05,
    clock_color: '#aaaaaa',
    background_color: '#000000',
    legend_color: '#aaaaaa',
    show_legend: true
  },
  'cumulative': {
    speed_gradient_min: 10 * MPH_TO_KPS,
    speed_gradient_max: 50 * MPH_TO_KPS,
    line_width: 1,
    line_cap: 'butt',
    color: null,
    alpha: 0.1,
    fade_alpha: 0,
    clock_color: '#aaaaaa',
    background_color: '#000000',
    legend_color: '#aaaaaa',
    show_legend: true
  },
  'white': {
    speed_gradient_min: 10 * MPH_TO_KPS,
    speed_gradient_max: 50 * MPH_TO_KPS,
    line_width: 1,
    line_cap: 'butt',
    color: '#ffffff',
    alpha: 0.3,
    fade_alpha: 0.05,
    clock_color: '#aaaaaa',
    background_color: '#000000',
    legend_color: '#aaaaaa',
    show_legend: true
  },
  'now': {
    speed_gradient_min: 10 * MPH_TO_KPS,
    speed_gradient_max: 50 * MPH_TO_KPS,
    line_width: 2,
    line_cap: 'butt',
    color: null,
    alpha: 1,
    fade_alpha: 1,
    clock_color: '#aaaaaa',
    background_color: '#000000',
    legend_color: '#aaaaaa',
    show_legend: true
  },
  'snake': {
    speed_gradient_min: 10 * MPH_TO_KPS,
    speed_gradient_max: 50 * MPH_TO_KPS,
    line_width: 6,
    line_cap: 'round',
    color: null,
    alpha: 1,
    fade_alpha: 0.05,
    clock_color: '#aaaaaa',
    background_color: '#000000',
    legend_color: '#aaaaaa',
    show_legend: true
  },
  'blurry': {
    speed_gradient_min: 10 * MPH_TO_KPS,
    speed_gradient_max: 50 * MPH_TO_KPS,
    line_width: 50,
    line_cap: 'round',
    color: null,
    alpha: 0.1,
    fade_alpha: 0.8,
    clock_color: '#aaaaaa',
    background_color: '#000000',
    legend_color: '#aaaaaa',
    show_legend: true
  }
};
